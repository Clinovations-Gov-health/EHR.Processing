/************** MODEL TYPE *************************/
export type User = {
    _id: string,
    claims: Claim[],
    lastRecommendPlans: PlanRecommendation | null,
    market: "individual" | "small group";
    demographic: "child" | "adult";
    zipCode: string;
    username: string;
    password: string;
} & ({
    target: "individual";
    age: number;
    usesTobacco: boolean;
} | {
    target: "family";
    hasSpouse: boolean;
    numChildren: number;
});

export interface Claim {
    starts: moment.Moment;
    ends: moment.Moment;
    diagnoses: { name: string; code: number; }[];
    totalCost: number;
}

export interface PlanRecommendation {
    costSortIds: string[];
    oopSortIds: string[];
    deductibleSortIds: string[];
    premiumSortIds: string[];
    maximumOOPSortIds: string[];
    plans: Record<string, PlanInfo>;
}

export type PlanInfo = {
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

export const DentalPlanMetalLevels = ['high', 'low'] as const;
export type DentalPlanMetalLevel = typeof DentalPlanMetalLevels[number];

export const NormalPlanMetalLevels = ['silver', 'expanded bronze', 'gold', 'catastrophic', 'platinum', 'bronze'] as const;
export type NormalPlanMetalLevel = typeof NormalPlanMetalLevels[number];

export const PlanTypes = ['Indemnity', 'PPO', 'EPO', 'POS', 'HMO'] as const;
export type PlanType = typeof PlanTypes[number];

export type BenefitItemCostSharingScheme =
    | {
          /**
           * The amount of the cost sharing. If isPercent is true, this is the percentage value (e.g. 30 stands for 30%).
           * If isPercent is false, this is the covered dollar value.
           */
          amount: number;
          /**
           * Whether the amount is a dollar value or a percentage.
           */
          isPercent: false;
          /**
           * Whether this cost sharing is applied before deductibles or after.
           */
          deductibleStatus: BenefitItemCostSharingDeductibleStatus;
          /**
           * How often is the cost sharing applied.
           */
          frequency: BenefitItemCostSharingFrequency;
      }
    | {
          /**
           * The amount of the cost sharing. If isPercent is true, this is the percentage value (e.g. 30 stands for 30%).
           * If isPercent is false, this is the covered dollar value.
           */
          amount: number;
          /**
           * Whether the amount is a dollar value or a percentage.
           */
          isPercent: true;
          /**
           * Whether this cost sharing is applied before deductibles or after.
           */
          deductibleStatus: BenefitItemCostSharingDeductibleStatus;
      };

export const BenefitItemCostSharingDeductibleStatuses = ['before', 'after', 'unknown'] as const;
export type BenefitItemCostSharingDeductibleStatus = typeof BenefitItemCostSharingDeductibleStatuses[number];

export const BenefitItemCostSharingFrequencies = ['day', 'once', 'stay'] as const;
export type BenefitItemCostSharingFrequency = typeof BenefitItemCostSharingFrequencies[number];