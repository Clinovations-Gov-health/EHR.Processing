import { FastifyInstance } from 'fastify';
import { ObjectId } from 'mongodb';
import { UserModel } from '../user/interface/user';
import { Inject } from '../util/decorators/inject.decorator';
import { Injectable } from '../util/decorators/injectable.decorator';
import { MongoService } from '../util/service/mongo.service';
import { WorkerService } from '../worker/worker.service';
import { Plan } from './interface/db/plan';
import { RatingAreaModel } from './interface/db/rating-area';
import { RecommendationEHRData } from './interface/payload';
import { PlanRecommendationReturnPayload } from './interface/return-payload';

@Injectable()
export class PlanService {
    @Inject(MongoService) private readonly mongoService!: MongoService;
    @Inject('Fastify') private readonly fastify!: FastifyInstance;
    @Inject(WorkerService) private readonly workerService!: WorkerService;

    async recommendPlan(userId: string): Promise<PlanRecommendationReturnPayload> {
        const userColl = this.mongoService.client.db('Clinovations').collection<UserModel>('User');
        const user = await userColl.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            throw this.fastify.httpErrors.badRequest("Invalid username.");
        }

        // First figure out the rating area of the user.
        const ratingAreaColl = this.mongoService.client.db('Clinovations').collection<RatingAreaModel>('RatingArea');
        const ratingArea = await ratingAreaColl.findOne({
            zipcodes: { $all: [user.zipCode] },
            market: { $in: ['both', user.market] },
        });
        if (!ratingArea) {
            throw this.fastify.httpErrors.badRequest('This zipcode is not supported by our system yet.');
        }

        const planColl = this.mongoService.client.db('Clinovations').collection<Plan>('Plan');
        const plans = await planColl
            .find({
                stateCode: ratingArea.state as any,
                demographics: { $in: ['both', user.demographic] },
                isIndividual: user.market === 'individual',
                isDentalOnly: false,
                ['rateDetail.' + ratingArea.ratingAreaId + '.target']: user.market,
                variationType: { $not: { $in: ["Zero Cost Sharing Plan Variation", "Limited Cost Sharing Plan Variation"]}},
                metalLevel: { $not: { $eq: "catastrophic" }},
            })
            .toArray();

        return this.workerService.threadPool.queue(worker => worker.recommendPlans(user, plans, ratingArea));
    }
}
