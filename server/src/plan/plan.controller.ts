import { FastifyReply, FastifyRequest } from 'fastify';
import { decode } from 'messagepack';
import { assertEquals } from 'typescript-is';
import { Controller } from '../util/decorators/controller.decorator';
import { Inject } from '../util/decorators/inject.decorator';
import { Route } from '../util/decorators/route.decorator';
import { RecommendationEHRData, RecommendationRequestQuery } from './interface/payload';
import { PlanService } from './plan.service';

@Controller('/plan')
export class PlanController {
    @Inject(PlanService) private readonly planService!: PlanService;

    constructor() {
        this.recommendationHandler = this.recommendationHandler.bind(this);
    }

    /**
     * Provides insurance plan recommendations given EHR data from the patient. The EHR data should be a hex encoding of the MessagePack serialization of the JSON object.
     */
    @Route({
        method: 'GET',
        url: '/recommendation',
        preValidation: (req, _, done) => {
            const queries = req.query as any;
            try {
                queries.data = JSON.parse(queries.data);
                // queries.data = decode(Buffer.from(queries.data, 'hex'));
                done();
            } catch (e) {
                done(e);
            }
        },
        schema: { querystring: {} },
        validatorCompiler: _ => {
            return (query: Record<string, any>) => {
                try {
                    assertEquals<RecommendationEHRData>(query.data);
                    return { value: query };
                } catch (e) {
                    return { error: e };
                }
            };
        },
    })
    async recommendationHandler(req: FastifyRequest<{ Querystring: RecommendationRequestQuery }>, res: FastifyReply) {
        const result = await this.planService.recommendPlan(req.query.data);
        return result;
    }
}
