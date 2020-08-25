import { mapValues, pick } from 'lodash';
import moment from 'moment';
import { expose } from 'threads';
import { WorkerFunction } from 'threads/dist/types/worker';
import { match, __ } from 'ts-pattern';
import { assertEquals } from 'typescript-is';
import { isMainThread } from 'worker_threads';
import { BenefitItemCostSharingScheme } from '../plan/interface/db/cost-sharing';
import { Plan } from '../plan/interface/db/plan';
import { RatingAreaModel } from '../plan/interface/db/rating-area';
import { RecommendationEHRData } from '../plan/interface/payload';
import { PlanRecommendationReturnPayload } from '../plan/interface/return-payload';

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

export class Worker implements Record<string, WorkerFunction> {
    [k: string]: WorkerFunction;

    /**
     * Finds if a provider's tier within a network.
     * 
     * @returns a tuple, the first element is whether the provider is in-network, and the second element is whether the plan is first tier in network.
     */
    private getProviderTier(plan: Plan, providerId: string): [boolean, boolean] {
        return [true, true];
    }

    /**
     * Returns whether the benefit is a drug benefit or a medical benefit.
     * 
     * @param name The name of the benefit.
     */
    private getBenefitType(name: string): "drug" | "medical" {
        return "medical";
    }

    private getDeductibleInformation(plan: Plan) {
        const dentalOnlyMatchFunc = (plan: Plan & { isDentalOnly: true }) => {
            const deductibles = {
                inNetwork: plan.deductible.inNetwork.individual ?? 0,
                outNetwork: plan.deductible.inNetwork.individual ?? 0,
                combined: plan.deductible.inNetwork.individual ?? 0,
            };

            return {
                inNetwork: plan.deductible.inNetwork.individual ?? 0,
                outNetwork: plan.deductible.outNetwork.individual ?? 0,
                combined: plan.deductible.combined.individual ?? 0,
                propertiesToDeduce: (type: "drug" | "medical", providerTier: [boolean, boolean]) =>
                    match<["drug" | "medical", boolean, boolean], Array<keyof typeof deductibles>>([type, ...providerTier])
                        .with([__, true, __], () => ["inNetwork", "combined"])
                        .with([__, false, __], () => ["outNetwork", "combined"])
                        .run(),
            };
        };

        const singleTieredIntegratedMatchFunc = (plan: Plan & { isDentalOnly: false, costCeiling: { isMultiTiered: false, deductible: { medicalDrugIntegrated: true } } }) => {
            const deductibles = {
                inNetwork: plan.costCeiling.deductible.inNetwork.individual ?? 0,
                outNetwork: plan.costCeiling.deductible.inNetwork.individual ?? 0,
                combined: plan.costCeiling.deductible.inNetwork.individual ?? 0,
            };
            
            return {
                ...deductibles,
                propertiesToDeduce: (type: "drug" | "medical", providerTier: [boolean, boolean]) =>
                    match<["drug" | "medical", boolean, boolean], Array<keyof typeof deductibles>>([type, ...providerTier])
                        .with([__, true, __], () => ["inNetwork", "combined"])
                        .with([__, false, __], () => ["outNetwork", "combined"])
                        .run(),
            };
        };

        const singleTieredUnintegratedMatchFunc = (plan: Plan & { isDentalOnly: false, costCeiling: { isMultiTiered: false, deductible: { medicalDrugIntegrated: false } } }) => {
            const deductibles = {
                medicalInNetwork: plan.costCeiling.deductible.medicalInNetwork.individual ?? 0,
                medicalOutNetwork: plan.costCeiling.deductible.medicalOutNetwork.individual ?? 0,
                medicalCombined: plan.costCeiling.deductible.medicalCombined.individual ?? 0,
                drugInNetwork: plan.costCeiling.deductible.drugInNetwork.individual ?? 0,
                drugOutNetwork: plan.costCeiling.deductible.drugOutNetwork.individual ?? 0,
                drugCombined: plan.costCeiling.deductible.drugCombined.individual ?? 0,
            };

            return {
                ...deductibles,
                propertiesToDeduce: (type: "drug" | "medical", providerTier: [boolean, boolean]) =>
                    match<["drug" | "medical", boolean, boolean], Array<keyof typeof deductibles>>([type, ...providerTier])
                        .with(["drug", true, __], () => ["drugInNetwork", "drugCombined"])
                        .with(["drug", false, __], () => ["drugOutNetwork", "drugCombined"])
                        .with(["medical", true, __], () => ["medicalInNetwork", "medicalCombined"])
                        .with(["medical", false, __], () => ["medicalOutNetwork", "medicalCombined"])
                        .run(),
            };
        };

        const multiTieredIntegratedMatchFunc = (plan: Plan & { isDentalOnly: false, costCeiling: { isMultiTiered: true, deductible: { medicalDrugIntegrated: true } } }) => {
            const deductibles = {
                tierOneInNetwork: plan.costCeiling.deductible.tierOneInNetwork.individual ?? 0,
                tierTwoInNetwork: plan.costCeiling.deductible.tierTwoInNetwork.individual ?? 0,
                outNetwork: plan.costCeiling.deductible.outNetwork.individual ?? 0,
                combined: plan.costCeiling.deductible.combined.individual ?? 0,
            };
            
            return {
                ...deductibles,
                propertiesToDeduce: (type: "drug" | "medical", providerTier: [boolean, boolean]) =>
                    match<["drug" | "medical", boolean, boolean], Array<keyof typeof deductibles>>([type, ...providerTier])
                        .with([__, true, true], () => ["tierOneInNetwork", "combined"])
                        .with([__, true, false], () => ["tierTwoInNetwork", "combined"])
                        .with([__, false, __], () => ["outNetwork", "combined"])
                        .run(),
            };
        };

        const multiTieredUnintegratedMatchFunc = (plan: Plan & { isDentalOnly: false, costCeiling: { isMultiTiered: true, deductible: { medicalDrugIntegrated: false } } }) => {
            const deductibles =  {
                medicalTierOneInNetwork: plan.costCeiling.deductible.medicalTierOneInNetwork.individual ?? 0,
                medicalTierTwoInNetwork: plan.costCeiling.deductible.medicalTierTwoInNetwork.individual ?? 0,
                medicalOutNetwork: plan.costCeiling.deductible.medicalOutNetwork.individual ?? 0,
                medicalCombined: plan.costCeiling.deductible.medicalCombined.individual ?? 0,
                drugTierOneInNetwork: plan.costCeiling.deductible.drugTierOneInNetwork.individual ?? 0,
                drugTierTwoInNetwork: plan.costCeiling.deductible.drugTierTwoInNetwork.individual ?? 0,
                drugOutNetwork: plan.costCeiling.deductible.drugOutNetwork.individual ?? 0,
                drugCombined: plan.costCeiling.deductible.drugCombined.individual ?? 0
            };

            return {
                ...deductibles,
                propertiesToDeduce: (type: "drug" | "medical", providerTier: [boolean, boolean]) =>
                    match<["drug" | "medical", boolean, boolean], Array<keyof typeof deductibles>>([type, ...providerTier])
                        .with(["drug", true, true], () => ["drugTierOneInNetwork", "drugCombined"])
                        .with(["drug", true, false], () => ["drugTierTwoInNetwork", "drugCombined"])
                        .with(["drug", false, __], () => ["drugOutNetwork", "drugCombined"])
                        .with(["medical", true, true], () => ["medicalTierOneInNetwork", "medicalCombined"])
                        .with(["medical", true, false], () => ["medicalTierTwoInNetwork", "medicalCombined"])
                        .with(["medical", false, __], () => ["medicalOutNetwork", "medicalCombined"])
                        .run(),
            };
        }

        type MatchFuncReturnTypes = 
              ReturnType<typeof dentalOnlyMatchFunc> 
            | ReturnType<typeof singleTieredIntegratedMatchFunc> 
            | ReturnType<typeof singleTieredUnintegratedMatchFunc>
            | ReturnType<typeof multiTieredIntegratedMatchFunc>
            | ReturnType<typeof multiTieredUnintegratedMatchFunc>;

        // NOTE: This is not correct.
        const totalDeductible = match<Plan, number | undefined>(plan)
            .with({ isDentalOnly: true }, plan => plan.deductible.inNetwork.individual)
            .with({ isDentalOnly: false, costCeiling: { isMultiTiered: false, deductible: { medicalDrugIntegrated: true } } }, plan => plan.costCeiling.deductible.inNetwork.individual)
            .with({ isDentalOnly: false, costCeiling: { isMultiTiered: true, deductible: { medicalDrugIntegrated: true } } }, plan => plan.costCeiling.deductible.tierOneInNetwork.individual)
            .with({ isDentalOnly: false, costCeiling: { isMultiTiered: false, deductible: { medicalDrugIntegrated: false } } }, plan => plan.costCeiling.deductible.medicalInNetwork.individual)
            .with({ isDentalOnly: false, costCeiling: { isMultiTiered: true, deductible: { medicalDrugIntegrated: false } } }, plan => plan.costCeiling.deductible.medicalTierOneInNetwork.individual)
            .run();

        const remainingDeductibles: MatchFuncReturnTypes = match<Plan, MatchFuncReturnTypes>(plan)
            .with({ isDentalOnly: true }, dentalOnlyMatchFunc)
            .with({ isDentalOnly: false, costCeiling: { isMultiTiered: false, deductible: { medicalDrugIntegrated: true } } }, singleTieredIntegratedMatchFunc)
            .with({ isDentalOnly: false, costCeiling: { isMultiTiered: true, deductible: { medicalDrugIntegrated: true } } }, multiTieredIntegratedMatchFunc)
            .with({ isDentalOnly: false, costCeiling: { isMultiTiered: false, deductible: { medicalDrugIntegrated: false } } }, singleTieredUnintegratedMatchFunc)
            .with({ isDentalOnly: false, costCeiling: { isMultiTiered: true, deductible: { medicalDrugIntegrated: false } } }, multiTieredUnintegratedMatchFunc)
            .run();

        return {
            totalAmount: totalDeductible,
            /**
             * Applies the cost for an encounter/treatment to the deductibles.
             */
            fulfill: (cost: number, type: "drug" | "medical", providerTier: [boolean, boolean]) => {
                const propertiesToDeduce = remainingDeductibles.propertiesToDeduce(type, providerTier) as string[];
                if (propertiesToDeduce.map(property => Reflect.get(remainingDeductibles, property) as number).includes(0)) {
                    return false;
                } else {
                    propertiesToDeduce.forEach(property => Reflect.set(remainingDeductibles, property, Math.max(Reflect.get(remainingDeductibles, property) - cost, 0)));
                    return true;
                }
            },
            /**
             * Checks if the deductible is already fulfilled.
             */
            fulfilled: (type: "drug" | "medical", providerTier: [boolean, boolean]) => {
                const propertiesToDeduce = remainingDeductibles.propertiesToDeduce(type, providerTier) as string[];
                return propertiesToDeduce.map(property => Reflect.get(remainingDeductibles, property) as number).includes(0);
            }
        };
    };

    public readonly recommendPlans = (patientData: RecommendationEHRData, plans: Plan[], ratingArea: RatingAreaModel): PlanRecommendationReturnPayload => {
        const encounters = patientData.encounters.map((encounter) => {
            const [price, name] = categoryMappings[encounter.type[0].coding[0].code];
            return {
                price,
                name,
                starts: moment(encounter.period.start),
                duration: moment.duration(moment(encounter.period.end).diff(moment(encounter.period.start))),
            };
        });

        const procedures = patientData.procedures.map((procedure) => {
            const [price, name] = categoryMappings[procedure.coding.encoding[0].code];
            return {
                price,
                name,
                starts: moment(procedure.period.start),
                duration: moment.duration(moment(procedure.period.end).diff(moment(procedure.period.start))),
            };
        });

        const result = plans
            .map<PlanRecommendationReturnPayload extends Array<infer P> ? P : never>(plan => {
                const deductible = this.getDeductibleInformation(plan);

                const outOfPocket = [...encounters, ...procedures]
                    .sort((first, second) => first.starts.isBefore(second.starts) ? -1 : 1)
                    .reduce((prev, encounter) => {
                        const benefitSharing = plan.benefits[encounter.name];

                        // If the benefit isn't even covered by the plan. The patient pays full price and it's
                        // not counted towards deductibles.
                        if (!benefitSharing?.covered) {
                            return prev + encounter.price;
                        }

                        const providerTier = this.getProviderTier(plan, "");
                        const benefitType = this.getBenefitType(encounter.name);
                        const benefitSharingScheme = match<[boolean, boolean], typeof benefitSharing["inNetworkTierTwo"]>(providerTier)
                            .with([true, true], () => benefitSharing.inNetworkTierOne)
                            .with([true, false], () => benefitSharing.inNetworkTierTwo)
                            .with([false, __], () => benefitSharing.outOfNetwork)
                            .run();

                        if (!deductible.fulfilled(benefitType, providerTier)) {
                            // Cost for the patient if the patient is still fulfilling the deductibles. It is undefined if the plan doesn't have pre-deductible
                            // cost sharings.
                            const beforeDeductibleCost = benefitSharingScheme?.filter(value => value.deductibleStatus === "before")
                                ?.reduce<number | undefined>((prev, scheme) => {
                                    return (prev === undefined ? 0 : prev) + (scheme.isPercent ? encounter.price * scheme.amount
                                        : scheme.frequency === "day" ? scheme.amount * encounter.duration.asDays()
                                        : scheme.amount);
                                }, undefined);

                            if (beforeDeductibleCost !== undefined) {
                                deductible.fulfill(beforeDeductibleCost, benefitType, providerTier)
                                return prev + beforeDeductibleCost;
                            } else {
                                deductible.fulfill(encounter.price, benefitType, providerTier);
                                return prev + encounter.price;
                            }
                        } else {
                            // Cost for the patient if the patient is after deductibles.
                            const afterDeductibleCost = benefitSharingScheme?.filter(value => value.deductibleStatus !== "before")
                                ?.reduce<number | undefined>((prev, scheme) => {
                                    return (prev === undefined ? 0 : prev) + (scheme.isPercent ? encounter.price * scheme.amount
                                        : scheme.frequency === "day" ? scheme.amount * encounter.duration.asDays()
                                        : scheme.amount);
                                }, undefined);

                            if (afterDeductibleCost !== undefined) {
                                return prev + afterDeductibleCost;
                            } else {
                                return prev + encounter.price;
                            }
                        }
                    }, 0);

                const rateDetail = plan.rateDetail[ratingArea.ratingAreaId];

                const premium = (() => {
                    if (patientData.target === 'individual' && rateDetail.target === 'individual') {
                        const ageIdx = patientData.age <= 14 ? 0 : patientData.age >= 64 ? 50 : patientData.age - 14;
                        return patientData.usesTobacco ? rateDetail.tobaccoRate[ageIdx] : rateDetail.rate[ageIdx];
                    } else if (patientData.target === 'family' && rateDetail.target === 'family') {
                        if (patientData.hasSpouse) {
                            return rateDetail.couple[Math.min(3, patientData.numChildren)];
                        } else {
                            return rateDetail.individual[Math.min(3, patientData.numChildren)];
                        }
                    } else {
                        throw Error("Invalid code path");
                    }
                })();

                // NOTE: This is not correct.
                const moop = match<Plan, number | undefined>(plan)
                    .with({ isDentalOnly: true }, plan => plan.oop.inNetwork.individual)
                    .with({ isDentalOnly: false, costCeiling: { isMultiTiered: false, oop: { medicalDrugIntegrated: true } } }, plan => plan.costCeiling.oop.inNetwork.individual)
                    .with({ isDentalOnly: false, costCeiling: { isMultiTiered: true, oop: { medicalDrugIntegrated: true } } }, plan => plan.costCeiling.oop.tierOneInNetwork.individual)
                    .with({ isDentalOnly: false, costCeiling: { isMultiTiered: false, oop: { medicalDrugIntegrated: false } } }, plan => plan.costCeiling.oop.medicalInNetwork.individual)
                    .with({ isDentalOnly: false, costCeiling: { isMultiTiered: true, oop: { medicalDrugIntegrated: false } } }, plan => plan.costCeiling.oop.medicalTierOneInNetwork.individual)
                    .run();

                const ceiledOOP = moop ? Math.min(moop, outOfPocket) : outOfPocket;

                return {
                    maximumOutOfPocket: moop ?? -1,
                    deductible: deductible.totalAmount ?? 0,
                    premium,
                    outOfPocket: ceiledOOP,
                    metalLevel: plan.metalLevel,
                    type: plan.planType,
                    cost: premium * 12 + ceiledOOP,
                    name: `${plan.marketingName} ${plan.variationType}`,
                    benefits: mapValues<typeof plan["benefits"], { covered: false } | { covered: true, details: [ BenefitItemCostSharingScheme ] | [ BenefitItemCostSharingScheme, BenefitItemCostSharingScheme ]}>(pick(plan.benefits, Object.values(categoryMappings).map(tp => tp[1])), val =>
                        val.covered
                            ? {
                                  covered: true,
                                  details: val.inNetworkTierOne,
                              }
                            : { covered: false }
                    ),
                };
            })
            .sort((res1, res2) => (res1.cost < res2.cost ? -1 : 1));

        assertEquals<PlanRecommendationReturnPayload>(result);

        console.log("Name, Premium, OutOfPocket, Cost, Deductible, MaximumOutOfPocket, Type, MetalLevel")
        result.forEach(planResult => {
            console.log(`${planResult.name}, ${planResult.premium}, ${planResult.outOfPocket}, ${planResult.cost}, ${planResult.deductible}, ${planResult.maximumOutOfPocket}, ${planResult.type}, ${planResult.metalLevel}`);
        })

        return result.slice(0, 5);
    }
}

if (!isMainThread) {
    const worker = new Worker();
    expose(worker);
}
