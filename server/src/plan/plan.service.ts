import { FastifyInstance } from 'fastify';
import { mapValues, pick } from 'lodash';
import moment from 'moment';
import { Inject } from '../util/decorators/inject.decorator';
import { Injectable } from '../util/decorators/injectable.decorator';
import { MongoService } from '../util/service/mongo.service';
import { Plan } from './interface/db/plan';
import { RatingAreaModel } from './interface/db/rating-area';
import { RecommendationEHRData } from './interface/payload';

@Injectable()
export class PlanService {
    @Inject(MongoService) private readonly mongoService!: MongoService;
    @Inject('Fastify') private readonly fastify!: FastifyInstance;

    async recommendPlan(patientData: RecommendationEHRData) {
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
                                  covered: val.covered,
                                  details: val.inNetworkTierOne,
                              }
                            : val
                    ),
                };
            })
            .sort((res1, res2) => (res1.cost < res2.cost ? -1 : 1))
            .slice(0, 5);

        return result;
    }
}
