import { FastifyReply, FastifyRequest } from "fastify";
import { decode, encode } from 'messagepack';
import { assertEquals } from 'typescript-is';
import { Controller } from '../util/decorators/controller.decorator';
import { Route } from "../util/decorators/route.decorator";
import { RecommendationEHRData, RecommendationRequestQuery } from "./interface/payload";
import { PlanService } from "./plan.service";
import { Inject } from "../util/decorators/inject.decorator";

@Controller("/plan")
export class PlanController {
    @Inject(PlanService) private readonly planService!: PlanService;

    /**
     * Provides insurance plan recommendations given EHR data from the patient. The EHR data should be a hex encoding of the MessagePack serialization of the JSON object.
     */
    @Route({ 
        method: "GET", 
        url: "/recommendation", 
        preValidation: (req, _, done) => {
            const queries = req.query as any;
            try {
                queries.data = decode(Buffer.from(queries.data, 'hex'));
                done();
            } catch (e) {
                done(e);
            }
        },
        schema: { querystring: {}, response: { "2xx": {} } },
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
        serializerCompiler: _ => {
            return (data: object) => Buffer.from(encode(data)).toString('hex');
        },
    })
    async recommendationHandler(req: FastifyRequest<{ Querystring: RecommendationRequestQuery }>, res: FastifyReply) {
        this.planService.recommendPlan(req.query.data, res);
    }
}