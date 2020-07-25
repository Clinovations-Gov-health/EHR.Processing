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
    covered: false;
} | {
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
    amount: number;
    isPercent: false;
    deductibleStatus: BenefitItemCostSharingDeductibleStatus;
    frequency: BenefitItemCostSharingFrequency;
} | {
    amount: number;
    isPercent: true;
    deductibleStatus: BenefitItemCostSharingDeductibleStatus;
};

export type BenefitItemLimit = {
    quantity: number;
    unit: BenefitItemLimitUnit;
    frequencyNum: number;
    frequencyUnit: BenefitItemLimitFrequency;
}