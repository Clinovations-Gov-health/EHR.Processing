import { BenefitItemCostSharingScheme } from "./db/cost-sharing";

export type PlanRecommendationReturnPayload = {
    cost: number;
    name: string;
    benefits: Record<string, { covered: false } | { covered: true, details: [ BenefitItemCostSharingScheme ] | [ BenefitItemCostSharingScheme, BenefitItemCostSharingScheme ]}>;
}[];