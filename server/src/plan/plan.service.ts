import { Injectable } from "../util/decorators/injectable.decorator";
import { inject } from "inversify";
import { MongoService } from "../util/service/mongo.service";
import { RecommendationEHRData } from "./interface/payload";
import { Plan } from "./interface/plan";
import zipcode from 'zipcodes';
import { FastifyInstance, FastifyReply } from 'fastify';
import { Client } from '@googlemaps/google-maps-services-js';

@Injectable()
export class PlanService {
    @inject(MongoService) private readonly mongoService!: MongoService;
    @inject("Fastify") private readonly fastify!: FastifyInstance;
    
    private readonly googleMapsClient = new Client({});

    async recommendPlan(patientData: RecommendationEHRData, res: FastifyReply) {

        this.googleMapsClient.placeDetails()
        const coll = this.mongoService.client.db('Clinovations').collection<Plan>('Plan');

        const stateCode = zipcode.lookup(patientData.zipCode)?.state;
        if (!stateCode) {
            throw this.fastify.httpErrors.badRequest("Invalid zipcode.");
        }
    }
}