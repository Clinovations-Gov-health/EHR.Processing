
/************** PAYLOADS FOR RecommendationPlans() ****************/
/**
 * The EHR Data payload provided in the `data` parameter of the request.
 */
export type PlanRecommendationPayload = {
    market: "individual" | "small group";
    demographic: "child" | "adult";
    target: "individual" | "family";
    zipCode: string;
    encounters: PatientEncounter[],
    procedures: PatientProcedure[],
} & ({
    target: "individual";
    age: number;
    usesTobacco: boolean;
} | {
    target: "family";
    hasSpouse: boolean;
    numChildren: number;
});

export interface PatientEncounter { 
    participants: string[],
    period: { 
        end: string,
        start: string
    },
    type: { 
        coding: { 
            code: string, 
            display: string,
            system: "snomed" | "cpt",
        }[]
    }[], 
    class: { 
        code: string
    }
}


export interface PatientProcedure { 
    period: { 
        end: string,
        start: string
    },
    coding: { 
        encoding: { 
            code: string,
            display: string,
            system: "snomed" | "cpt",
        }[]
    }, 
    encounterContext: { 
        reference: string
    }
}

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


/**************** COMMON TYPES *******************/

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

export type BenefitItemLimit = {
    /**
     * Number of the limit.
     */
    quantity: number;
    /**
     * Unit of the limit.
     */
    unit: BenefitItemLimitUnit;
    /**
     * Number of how often is the limit applied.
     */
    frequencyNum: number;
    /**
     * Unit of how often is the limit applied.
     */
    frequencyUnit: BenefitItemLimitFrequency;
};


export const DataSources = ['rate', 'attributes', 'costSharing'] as const;
export type DataSource = typeof DataSources[number];

export const StateCodes = [
    'AK',
    'AL',
    'AR',
    'AZ',
    'DE',
    'FL',
    'GA',
    'HI',
    'IA',
    'IL',
    'IN',
    'KS',
    'KY',
    'LA',
    'ME',
    'MI',
    'MO',
    'MS',
    'MT',
    'NC',
    'ND',
    'NE',
    'NH',
    'NJ',
    'NM',
    'OH',
    'OK',
    'OR',
    'PA',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VA',
    'WI',
    'WV',
    'WY',
] as const;
export type StateCode = typeof StateCodes[number];

export const PlanTypes = ['Indemnity', 'PPO', 'EPO', 'POS', 'HMO'] as const;
export type PlanType = typeof PlanTypes[number];

export const DentalPlanMetalLevels = ['high', 'low'] as const;
export type DentalPlanMetalLevel = typeof DentalPlanMetalLevels[number];

export const NormalPlanMetalLevels = ['silver', 'expanded bronze', 'gold', 'catastrophic', 'platinum', 'bronze'] as const;
export type NormalPlanMetalLevel = typeof NormalPlanMetalLevels[number];

export const PlanDemographics = ['both', 'adult', 'child'] as const;
export type PlanDemographic = typeof PlanDemographics[number];

export const BenefitItemCostSharingDeductibleStatuses = ['before', 'after', 'unknown'] as const;
export type BenefitItemCostSharingDeductibleStatus = typeof BenefitItemCostSharingDeductibleStatuses[number];

export const BenefitItemCostSharingFrequencies = ['day', 'once', 'stay'] as const;
export type BenefitItemCostSharingFrequency = typeof BenefitItemCostSharingFrequencies[number];

export const BenefitItemLimitUnits = ['hour', 'day', 'month', 'visit', 'treatment', 'procedure', 'dollar', 'exam', 'item'] as const;
export type BenefitItemLimitUnit = typeof BenefitItemLimitUnits[number];

export const BenefitItemLimitFrequencies = [
    'week',
    'month',
    'year',
    'visit',
    'admission',
    'episode',
    'lifetime',
    'benefit period',
    'stay',
    'procedure',
    'transplant',
] as const;
export type BenefitItemLimitFrequency = typeof BenefitItemLimitFrequencies[number];
