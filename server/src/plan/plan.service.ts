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

@Injectable()
export class PlanService {
    @Inject(MongoService) private readonly mongoService!: MongoService;
    @Inject('Fastify') private readonly fastify!: FastifyInstance;

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

        const categoryMappings: Record<string, [number, string]> = {
            '185349003': [150, 'Primary Care Visit to Treat an Injury or Illness'],
            '50849002': [1389, 'Emergency Room Services'],
            '185345009': [150, 'Primary Care Visit to Treat an Injury or Illness'],
            '1225002': [410, 'X-rays and Diagnostic Imaging'],
            "225158009": [100, "Prenatal and Postnatal care"],
            "117010004": [50, "Preventive Care/Screening/Immunization"],
            "104326007": [200, "Testing Services"],
            "171207006": [5, "Mental/Behavioral Health Outpatient Services"],
            "31676001": [200, "Testing Services"],
            "269828009": [200, "Testing Services"],
            "399014008": [50, "Preventive Care/Screening/Immunization"],
            "443529005": [50, "Preventive Care/Screening/Immunization"],
            "44608003": [50, "Preventive Care/Screening/Immunization"],
            "310861008": [200, "Testing Services"],
            "395123002": [50, "Preventive Care/Screening/Immunization"],
            "165829005": [200, "Testing Services"],
            "275833003": [200, "Testing Services"],
            "167271000": [50, "Preventive Care/Screening/Immunization"],
            "271442007": [300, "Prenatal and Postnatal care"],
            "47758006": [200, "Testing Services"],
            "714812005": [700, "Abortion for Which Public Funding is Prohibited"],
            "28163009": [200, "Testing Services"],
            "90226004": [50, "Preventive Care/Screening/Immunization"],
            "104091002": [50, "Preventive Care/Screening/Immunization"],
            "104375008": [200, "Testing Services"],
            "169230002": [410, "X-rays and Diagnostic Imaging"],
            "252160004": [200, "Testing Services"],
            "169690007": [50, "Preventive Care/Screening/Immunization"],
            "65200003": [500, "Contraceptive Services"],
            "268556000": [50, "Preventive Care/Screening/Immunization"],
            "5880005": [50, "Preventive Care/Screening/Immunization"],
            "68254000": [500, "Contraceptive Services"],
        };

        const encounters = patientData.encounters.map((encounter) => {
            const [price, name] = categoryMappings[encounter.type[0].coding[0].code];
            return {
                price,
                name,
                duration: moment.duration(moment(encounter.period.end).diff(moment(encounter.period.start))),
            };
        });

        const procedures = patientData.procedures.map((procedure) => {
            const [price, name] = categoryMappings[procedure.coding.encoding[0].code];
            return {
                price,
                name,
                duration: moment.duration(moment(procedure.period.end).diff(moment(procedure.period.start))),
            };
        });

        const result = plans
            .map((plan) => {
                let cost = [...encounters, ...procedures].reduce((prev, item) => {
                    const benefitSharing = plan.benefits[item.name];

                    if (!benefitSharing?.covered) {
                        return item.price;
                    }

                    return (
                        prev +
                        benefitSharing.inNetworkTierOne.reduce((prev, scheme) => {
                            if (scheme.isPercent) {
                                return prev + (item.price * scheme.amount) / 100;
                            } else {
                                if (scheme.frequency === 'day') {
                                    return prev + scheme.amount * item.duration.asDays();
                                }
                                return prev + scheme.amount;
                            }
                        }, 0)
                    );
                }, 0);

                const rateDetail = plan.rateDetail[ratingArea.ratingAreaId];
                if (patientData.target === 'individual' && rateDetail.target === 'individual') {
                    const ageIdx = patientData.age <= 14 ? 0 : patientData.age >= 64 ? 50 : patientData.age - 14;
                    cost += patientData.usesTobacco ? rateDetail.tobaccoRate[ageIdx] : rateDetail.rate[ageIdx];
                } else if (patientData.target === 'family' && rateDetail.target === 'family') {
                    if (patientData.hasSpouse) {
                        cost += rateDetail.couple[Math.min(3, patientData.numChildren)];
                    } else {
                        cost += rateDetail.individual[Math.min(3, patientData.numChildren)];
                    }
                }

                return {
                    cost,
                    name: plan.marketingName,
                    benefits: mapValues(pick(plan.benefits, ...new Set(Object.values(categoryMappings).map(([_, name]) => name))), (val) =>
                        val.covered
                            ? {
                                  covered: true,
                                  details: val.inNetworkTierOne,
                              }
                            : { covered: false }
                    ),
                };
            })
            .sort((res1, res2) => (res1.cost < res2.cost ? -1 : 1))
            .slice(0, 5);

        
        try {
            assertEquals<PlanRecommendationReturnPayload>(result);
        } catch (e) {
            throw this.fastify.httpErrors.internalServerError();
        }

        return result as any;
    }
}
