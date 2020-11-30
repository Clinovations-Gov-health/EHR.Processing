import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { UserService } from '../user/user.service';
import { Controller } from '../util/decorators/controller.decorator';
import { Inject } from '../util/decorators/inject.decorator';
import { Route } from '../util/decorators/route.decorator';
import { RecommendationRequestQuery } from './interface/payload';
import { PlanService } from './plan.service';


@Controller('/plan')
export class PlanController {
    @Inject(PlanService) private readonly planService!: PlanService;
    @Inject(UserService) private readonly userService!: UserService;
    @Inject('Fastify') private readonly fastify!: FastifyInstance;

    constructor() {
        this.recommendationHandler = this.recommendationHandler.bind(this);
    }

    /**
     * Provides insurance plan recommendations given EHR data from the patient. The EHR data should be a hex encoding of the MessagePack serialization of the JSON object.
     */
    @Route({
        method: 'GET',
        url: '/recommendation',
    })
    async recommendationHandler(req: FastifyRequest<{ Querystring: RecommendationRequestQuery }>, res: FastifyReply) {
        const authCode = req.headers.authorization?.split(' ');
        if (!authCode || authCode.length !== 2) {
            throw this.fastify.httpErrors.badRequest("Invalid authorization info.");
        }

        const userId = await this.userService.verifyJwtToken(authCode[1]);

        const result = await this.planService.recommendPlan(userId);
        await this.userService.updateUser(userId, { $set: { lastRecommendPlans: result }});
        return result;
    }
}
