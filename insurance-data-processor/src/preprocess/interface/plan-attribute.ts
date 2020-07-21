import { StateCode, PlanType, DentalPlanMetalLevel, NormalPlanMetalLevel } from "../../util";

export type PlanAttributePreprocessModel = {
    /**
     * Two-digit abbreviation of the state in which the plan is marketed.
     */
    stateCode: StateCode;
    /**
     * Five-digit numeral id of the plan issuer.
     */
    issuerId: string;
    /**
     * Whether a plan covers the individual market or the small group market.
     */
    isIndividual: boolean;
    /**
     * Id of the standard component of the plan. This and the variant id together uniquely identifies a plan.
     */
    standardComponentId: string;
    /**
     * Marketing name of the plan.
     */
    marketingName: string;
    /**
     * Type of the plan.
     */
    planType: PlanType;
    /**
     * Whether there is a plan level exclusion. An existence of such makes our estimation imprecise.
     */
    hasPlanLevelExclusions: boolean;
    /**
     * Whether the plan is restricted to adults or children or neither.
     */
    demographics: "both" | "adult" | "child";
    /**
     * Whether the plan's rate is guaranteed or estimated.
     */
    isGuaranteed: boolean;
    /**
     * Whether the plan is supported by a national network.
     */
    nationalNetwork: boolean;
    /**
     * Variant ID of this plan. This and the standard component ID together uniquely identify a plan.
     */
    variantId: string;
    /**
     * Name of the cost sharing options for this plan.
     */
    variationType: string;
    /**
     * Maximum number of days for which a patient can be charged copayment for an inpatient visit, if the plan charges
     * in person visits by day.
     */
    inpatientCopaymentMaximumDays?: number;
    /**
     * Maximum number of fully covered visits allowed, after which primary care cost sharing begins.
     */
    beginPrimaryCareCostSharingAfterNumberOfVisits?: number;
    /**
     * Maximum number of primary care visits with co-payment allowed, after which all primary care visits will be subject to the deducitble
     * or maximum out of pocket limits.
     */
    beginPrimaryCareDeducitableCoinsuranceAfterNumberOfCopays?: number;
    /**
     * URL to the brochure describing the plan in more detail.
     */
    brochureUrl?: string;
} & DentalOnlyDependentProperties;

/**
 * Properties dependent on whether the plan is dental-only.
 */
type DentalOnlyDependentProperties = {
    /**
     * Whether a plan only covers dental.
     */
    isDentalOnly: true;
    /**
     * Metal level of the plan. As this is dental-only the metal levels only include `high` and `low`.
     */
    metalLevel: DentalPlanMetalLevel;
    oop: {
        inNetwork: SingleOOPProperties;
        outNetwork: SingleOOPProperties;
        combined: SingleOOPProperties;
    },
    deductible: {
        inNetwork: SingleDeductiblePropertiesWithCoinsurance;
        outNetwork: SingleDeductibleProperties;
        combined: SingleDeductibleProperties;
    }
} | ({
    /**
     * Whether a plan only covers dental.
     */
    isDentalOnly: false;
    /**
     * Id to identify the pharmacy network and formulary information for this plan.
     */
    formularyId: string;
    /**
     * Metal level of the plan.
     */
    metalLevel: NormalPlanMetalLevel;
    /**
     * Disease management program information.
     */
    dmp: {
        wellness: boolean;
        asthma: boolean;
        heartDisease: boolean;
        depression: boolean;
        diabetes: boolean;
        highBloodPressureAndHighCholesterol: boolean;
        lowBackPain: boolean;
        painManagement: boolean;
        pregnancy: boolean;
        weightLoss: boolean;
    },
    /**
     * URL for prescription drug formulary.
     */
    formularyUrl: string;
    /**
     * Maximum dollar value of coinsurance for specialty high-cost drugs.
     */
    specialityDrugMaximumCoinsurance?: number;
    /**
     * Whether the provider networks are multi-tiered.
     */
    isMultiTiered: boolean;
    /**
     * Whether the medical and drug deductibles are integrated by the plan issuer.
     */
    medicalDrugDeductibleIntegrated: boolean;
    /**
     * Whether the medical and drug OOPs are integrated by the plan issuer.
     */
    medicalDrugOOPIntegrated: boolean;
} & OOPProperties);

type SingleOOPProperties = {
    individual?: number;
    familyPerPerson?: number;
    familyPerGroup?: number;
}

type SingleDeductibleProperties = {
    individual?: number;
    familyPerPerson?: number;
    familyPerGroup?: number;
};

type SingleDeductiblePropertiesWithCoinsurance = {
    coinsurance?: number;
} & SingleDeductibleProperties;

type OOPProperties = {
    isMultiTiered: false;
    medicalDrugOOPIntegrated: true;
    oop: {
        inNetwork: SingleOOPProperties;
        outNetwork: SingleOOPProperties;
        combined: SingleOOPProperties;
    },
    deductible: {
        inNetwork: SingleDeductiblePropertiesWithCoinsurance;
        outNetwork: SingleDeductibleProperties;
        combined: SingleDeductibleProperties;
    },
} | {
    isMultiTiered: true;
    medicalDrugOOPIntegrated: true;
    oop: {
        tierOneInNetwork: SingleOOPProperties;
        tierTwoInNetwork: SingleOOPProperties;
        outNetwork: SingleOOPProperties;
        combined: SingleOOPProperties;
    },
    deductible: {
        tierOneInNetwork: SingleDeductiblePropertiesWithCoinsurance;
        tierTwoInNetwork: SingleDeductiblePropertiesWithCoinsurance;
        outNetwork: SingleDeductibleProperties;
        combined: SingleDeductibleProperties;
    }
} | {
    isMultiTiered: false;
    medicalDrugOOPIntegrated: false;
    oop: {
        medicalInNetwork: SingleOOPProperties;
        medicalOutNetwork: SingleOOPProperties;
        medicalCombined: SingleOOPProperties;
        drugInNetwork: SingleOOPProperties;
        drugOutNetwork: SingleOOPProperties;
        drugCombined: SingleOOPProperties;
    },
    deductible: {
        medicalInNetwork: SingleDeductiblePropertiesWithCoinsurance;
        medicalOutNetwork: SingleDeductibleProperties;
        medicalCombined: SingleDeductibleProperties;
        drugInNetwork: SingleDeductiblePropertiesWithCoinsurance;
        drugOutNetwork: SingleDeductibleProperties;
        drugCombined: SingleDeductibleProperties;
    }
} | {
    isMultiTiered: true;
    medicalDrugOOPIntegrated: false;
    oop: {
        medicalTierOneInNetwork: SingleOOPProperties;
        medicalTierTwoInNetwork: SingleOOPProperties;
        medicalOutNetwork: SingleOOPProperties;
        medicalCombined: SingleOOPProperties;
        drugTierOneInNetwork: SingleOOPProperties;
        drugTierTwoInNetwork: SingleOOPProperties;
        drugOutNetwork: SingleOOPProperties;
        drugCombined: SingleOOPProperties;
    },
    deductible: {
        medicalTierOneInNetwork: SingleDeductiblePropertiesWithCoinsurance;
        medicalTierTwoInNetwork: SingleDeductiblePropertiesWithCoinsurance;
        medicalOutNetwork: SingleDeductibleProperties;
        medicalCombined: SingleDeductibleProperties;
        drugTierOneInNetwork: SingleDeductiblePropertiesWithCoinsurance;
        drugTierTwoInNetwork: SingleDeductiblePropertiesWithCoinsurance;
        drugOutNetwork: SingleDeductibleProperties;
        drugCombined: SingleDeductibleProperties;
    },
}