import { FastifyInstance } from 'fastify';
import { mapValues, pick } from 'lodash';
import moment from 'moment';
import { Inject } from '../util/decorators/inject.decorator';
import { Injectable } from '../util/decorators/injectable.decorator';
import { MongoService } from '../util/service/mongo.service';
import { Plan } from './interface/db/plan';
import { RatingAreaModel } from './interface/db/rating-area';
import { RecommendationEHRData } from './interface/payload';
import { PlanRecommendationReturnPayload } from './interface/return-payload';
import { assertEquals } from 'typescript-is';
import { WorkerService } from '../worker/worker.service';

@Injectable()
export class PlanService {
    @Inject(MongoService) private readonly mongoService!: MongoService;
    @Inject('Fastify') private readonly fastify!: FastifyInstance;
    @Inject(WorkerService) private readonly workerService!: WorkerService;

    async recommendPlan(patientData: RecommendationEHRData): Promise<PlanRecommendationReturnPayload> {
        // First figure out the rating area of the user.
        const ratingAreaColl = this.mongoService.client.db('Clinovations').collection<RatingAreaModel>('RatingArea');
        const ratingArea = await ratingAreaColl.findOne({
            zipcodes: { $all: [patientData.zipCode] },
            market: { $in: ['both', patientData.market] },
        });
        if (!ratingArea) {
            throw this.fastify.httpErrors.badRequest('This zipcode is not supported by our system yet.');
        }

        const planColl = this.mongoService.client.db('Clinovations').collection<Plan>('Plan');
        const plans = await planColl
            .find({
                stateCode: ratingArea.state as any,
                demographics: { $in: ['both', patientData.demographic] },
                isIndividual: patientData.market === 'individual',
                isDentalOnly: false,
                ['rateDetail.' + ratingArea.ratingAreaId + '.target']: patientData.market,
            })
            .toArray();

        return this.workerService.threadPool.queue(worker => worker.recommendPlans(patientData, plans, ratingArea));
    }
}
