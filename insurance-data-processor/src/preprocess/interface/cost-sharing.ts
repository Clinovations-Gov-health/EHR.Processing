import { BenefitItemCostSharingDeductibleStatus, BenefitItemCostSharingFrequency, BenefitItemLimitUnit, BenefitItemLimitFrequency } from "../../util";

export interface RawCostSharingModel {
    PlanId: string;
    BenefitName: string;
    CopayInnTier1?: string;
    CopayInnTier2?: string;
    CopayOutofNet?: string;
    CoinsInnTier1?: string;
    CoinsInnTier2?: string;
    CoinsOutofNet?: string;
    IsEHB?: string;
    IsCovered?: string;
    QuantLimitOnSvc?: string;
    LimitQty?: string;
    LimitUnit?: string;
    Exclusions?: string;
    Explanation?: string;
    IsExclFromInnMOOP?: string;
    IsExclFromOonMOOP?: string;
}

export interface CostSharingPreprocessModel {
    standardComponentId: string;
    variantId: string;
    benefits: Record<string, CostSharingBenefit>;
}

export type CostSharingBenefit = {
    /**
     * Whether this benefit is covered by the plan.
     */
    covered: false;
} | {
    /**
     * Whether this benefit is covered by the plan.
     */
    covered: true;
    exclusions?: string;
    explanations?: string;
    inNetworkTierOne: [BenefitItemCostSharingScheme] | [BenefitItemCostSharingScheme, BenefitItemCostSharingScheme];
    inNetworkTierTwo?: [BenefitItemCostSharingScheme] | [BenefitItemCostSharingScheme, BenefitItemCostSharingScheme];
    outOfNetwork: [BenefitItemCostSharingScheme] | [BenefitItemCostSharingScheme, BenefitItemCostSharingScheme];
    limit?: BenefitItemLimit;
    ehbInfo?: EHBInfo,
};

export type EHBInfo = {
    isExcludedFromInNetworkMOOP: boolean;
    isExcludedFromOutOfNetworkMOOP: boolean;
};

export type BenefitItemCostSharingScheme = {
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
} | {
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
}