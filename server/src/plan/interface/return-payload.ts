import { BenefitItemCostSharingScheme } from "./db/cost-sharing";
import { DentalPlanMetalLevel, NormalPlanMetalLevel, PlanType } from "../../util/types";

export interface PlanRecommendationReturnPayload {
    costSortIds: string[];
    oopSortIds: string[];
    deductibleSortIds: string[];
    premiumSortIds: string[];
    maximumOOPSortIds: string[];
    plans: Record<string, PlanRecommendationReturnPayloadPlanInfo>;
}

export type PlanRecommendationReturnPayloadPlanInfo = {
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
};