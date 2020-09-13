import { BenefitItemCostSharingScheme } from "./db/cost-sharing";
import { DentalPlanMetalLevel, NormalPlanMetalLevel, PlanType } from "../../util/types";

export type PlanRecommendationReturnPayload = {
    deductible: number;
    premium: number;
    outOfPocket: number;
    maximumOutOfPocket: number;
    metalLevel: DentalPlanMetalLevel | NormalPlanMetalLevel,
    type: PlanType,
    cost: number,
    name: string;
    benefits: Record<string, {
        preDeductible: { copay?: BenefitItemCostSharingScheme, coinsurance?: BenefitItemCostSharingScheme },
        afterDeductible: { copay?: BenefitItemCostSharingScheme, coinsurance?: BenefitItemCostSharingScheme },
    }>;
}[];