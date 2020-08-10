import { Injectable } from "../util/decorators/injectable.decorator";
import { MongoService } from "../util/service/mongo.service";
import { RecommendationEHRData } from "./interface/payload";
import { Plan } from "./interface/plan";
import zipcode from 'zipcodes';
import { FastifyInstance, FastifyReply } from 'fastify';
import { Client } from '@googlemaps/google-maps-services-js';
import { Inject } from "../util/decorators/inject.decorator";

@Injectable()
export class PlanService {
    @Inject(MongoService) private readonly mongoService!: MongoService;
    @Inject("Fastify") private readonly fastify!: FastifyInstance;
    
    private readonly googleMapsClient = new Client({});

    async recommendPlan(patientData: RecommendationEHRData, res: FastifyReply) {
        const coll = this.mongoService.client.db('Clinovations').collection<Plan>('Plan');

        const stateCode = zipcode.lookup(patientData.zipCode)?.state;
        if (!stateCode) {
            throw this.fastify.httpErrors.badRequest("Invalid zipcode.");
        }
    }
}