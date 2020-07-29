import { Controller, GET } from "fastify-decorators";
import { FastifyRequest, FastifyReply } from "fastify";
import { decode } from 'messagepack';
import { RecommendationRequestParams, RecommendationEHRData } from "./interface/payload";
import { is } from 'typescript-is';

@Controller({ route: '/plan' })
export default class PlanController {
    /**
     * Provides insurance plan recommendations given EHR data from the patient. The EHR data should be a base-64 encoding of the MessagePack serialization of the JSON object.
     */
    @GET({ url: "/recommendation" })
    async recommendationHandler(req: FastifyRequest<{ Params: RecommendationRequestParams }>, res: FastifyReply) {
        // Deserializes the json object.
        // const ehrData = decode<RecommendationEHRData>(Buffer.from(req.params.data, 'base64'));
        if (!is<RecommendationEHRData>(3)) {
            res.status(404).send();
        }
        return {};
    }
}