import { DentalPlanMetalLevel, NormalPlanMetalLevel, PlanDemographic, PlanType, StateCode } from "../../util";

/**
 * Shape of the raw CSV table data for plan attributes.
 */
export interface RawAttributeModel {
    StateCode: string;
    IssuerId: string;
    MarketCoverage: string;
    DentalOnlyPlan: string;
    StandardComponentId: string;
    PlanMarketingName: string;
    NetworkId: string;
    ServiceAreaId: string;
    FormularyId?: string;
    PlanType: string;
    MetalLevel: string;
    PlanLevelExclusions?: string;
    ChildOnlyOffering: string;
    WellnessProgramOffered?: string;
    DiseaseManagementProgramsOffered?: string;
    IsGuaranteedRate?: string;
    NationalNetwork: string;
    FormularyURL?: string;
    PlanId: string;
    CSRVariationType: string;
    MultipleInNetworkTiers: string;
    MedicalDrugDeductiblesIntegrated?: string;
    MedicalDrugMaximumOutofPocketIntegrated?: string;
    SpecialtyDrugMaximumCoinsurance?: string;
    InpatientCopaymentMaximumDays: string;
    BeginPrimaryCareCostSharingAfterNumberOfVisits: string;
    BeginPrimaryCareDeductibleCoinsuranceAfterNumberOfCopays: string;
    MEHBInnTier1IndividualMOOP?: string;
    MEHBInnTier1FamilyPerPersonMOOP?: string;
    MEHBInnTier1FamilyPerGroupMOOP?: string;
    MEHBInnTier2IndividualMOOP?: string;
    MEHBInnTier2FamilyPerPersonMOOP?: string;
    MEHBInnTier2FamilyPerGroupMOOP?: string;
    MEHBOutOfNetIndividualMOOP?: string;
    MEHBOutOfNetFamilyPerPersonMOOP?: string;
    MEHBOutOfNetFamilyPerGroupMOOP?: string;
    MEHBCombInnOonIndividualMOOP?: string;
    MEHBCombInnOonFamilyPerPersonMOOP?: string;
    MEHBCombInnOonFamilyPerGroupMOOP?: string;
    DEHBInnTier1IndividualMOOP?: string;
    DEHBInnTier1FamilyPerPersonMOOP?: string;
    DEHBInnTier1FamilyPerGroupMOOP?: string;
    DEHBInnTier2IndividualMOOP?: string;
    DEHBInnTier2FamilyPerPersonMOOP?: string;
    DEHBInnTier2FamilyPerGroupMOOP?: string;
    DEHBOutOfNetIndividualMOOP?: string;
    DEHBOutOfNetFamilyPerPersonMOOP?: string;
    DEHBOutOfNetFamilyPerGroupMOOP?: string;
    DEHBCombInnOonIndividualMOOP?: string;
    DEHBCombInnOonFamilyPerPersonMOOP?: string;
    DEHBCombInnOonFamilyPerGroupMOOP?: string;
    TEHBInnTier1IndividualMOOP?: string;
    TEHBInnTier1FamilyPerPersonMOOP?: string;
    TEHBInnTier1FamilyPerGroupMOOP?: string;
    TEHBInnTier2IndividualMOOP?: string;
    TEHBInnTier2FamilyPerPersonMOOP?: string;
    TEHBInnTier2FamilyPerGroupMOOP?: string;
    TEHBOutOfNetIndividualMOOP?: string;
    TEHBOutOfNetFamilyPerPersonMOOP?: string;
    TEHBOutOfNetFamilyPerGroupMOOP?: string;
    TEHBCombInnOonIndividualMOOP?: string;
    TEHBCombInnOonFamilyPerPersonMOOP?: string;
    TEHBCombInnOonFamilyPerGroupMOOP?: string;
    MEHBDedInnTier1Individual?: string;
    MEHBDedInnTier1FamilyPerPerson?: string;
    MEHBDedInnTier1FamilyPerGroup?: string;
    MEHBDedInnTier1Coinsurance?: string;
    MEHBDedInnTier2Individual?: string;
    MEHBDedInnTier2FamilyPerPerson?: string;
    MEHBDedInnTier2FamilyPerGroup?: string;
    MEHBDedInnTier2Coinsurance?: string;
    MEHBDedOutOfNetIndividual?: string;
    MEHBDedOutOfNetFamilyPerPerson?: string;
    MEHBDedOutOfNetFamilyPerGroup?: string;
    MEHBDedCombInnOonIndividual?: string;
    MEHBDedCombInnOonFamilyPerPerson?: string;
    MEHBDedCombInnOonFamilyPerGroup?: string;
    DEHBDedInnTier1Individual?: string;
    DEHBDedInnTier1FamilyPerPerson?: string;
    DEHBDedInnTier1FamilyPerGroup?: string;
    DEHBDedInnTier1Coinsurance?: string;
    DEHBDedInnTier2Individual?: string;
    DEHBDedInnTier2FamilyPerPerson?: string;
    DEHBDedInnTier2FamilyPerGroup?: string;
    DEHBDedInnTier2Coinsurance?: string;
    DEHBDedOutOfNetIndividual?: string;
    DEHBDedOutOfNetFamilyPerPerson?: string;
    DEHBDedOutOfNetFamilyPerGroup?: string;
    DEHBDedCombInnOonIndividual?: string;
    DEHBDedCombInnOonFamilyPerPerson?: string;
    DEHBDedCombInnOonFamilyPerGroup?: string;
    TEHBDedInnTier1Individual?: string;
    TEHBDedInnTier1FamilyPerPerson?: string;
    TEHBDedInnTier1FamilyPerGroup?: string;
    TEHBDedInnTier1Coinsurance?: string;
    TEHBDedInnTier2Individual?: string;
    TEHBDedInnTier2FamilyPerPerson?: string;
    TEHBDedInnTier2FamilyPerGroup?: string;
    TEHBDedInnTier2Coinsurance?: string;
    TEHBDedOutOfNetIndividual?: string;
    TEHBDedOutOfNetFamilyPerPerson?: string;
    TEHBDedOutOfNetFamilyPerGroup?: string;
    TEHBDedCombInnOonIndividual?: string;
    TEHBDedCombInnOonFamilyPerPerson?: string;
    TEHBDedCombInnOonFamilyPerGroup?: string;
    PlanBrochure?: string;
}

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
    planLevelExclusions?: string;
    /**
     * Whether the plan is restricted to adults or children or neither.
     */
    demographics: PlanDemographic;
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
    inPatientCopaymentMaximumDays?: number;
    /**
     * Maximum number of fully covered visits allowed, after which primary care cost sharing begins.
     */
    beginPrimaryCareCostSharingAfterNumberOfVisits?: number;
    /**
     * Maximum number of primary care visits with co-payment allowed, after which all primary care visits will be subject to the deducitble
     * or maximum out of pocket limits.
     */
    beginPrimaryCareDeductibleCoinsuranceAfterNumberOfCopays?: number;
    /**
     * URL to the brochure describing the plan in more detail.
     */
    brochureUrl?: string;
} & DentalOnlyDependentProperties;

/**
 * Properties dependent on whether the plan is dental-only.
 */
export type DentalOnlyDependentProperties = {
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
} | {
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
    specialtyDrugMaximumCoinsurance?: number;

    costCeiling: CostCeilingProperties;
};

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

export type CostCeilingProperties = {
    isMultiTiered: false;
    oop: SingleTieredOOPProperties;
    deductible: SingleTieredMaximumDeducitbleProperties;
} | {
    isMultiTiered: true;
    oop: MultiTieredOOPProperties;
    deductible: MultiTieredMaximumDeductibleProperties;
}

export type SingleTieredOOPProperties = {
    medicalDrugIntegrated: true;
    inNetwork: SingleOOPProperties;
    outNetwork: SingleOOPProperties;
    combined: SingleOOPProperties;
} | {
    medicalDrugIntegrated: false;
    medicalInNetwork: SingleOOPProperties;
    medicalOutNetwork: SingleOOPProperties;
    medicalCombined: SingleOOPProperties;
    drugInNetwork: SingleOOPProperties;
    drugOutNetwork: SingleOOPProperties;
    drugCombined: SingleOOPProperties;
};

export type MultiTieredOOPProperties = {
    medicalDrugIntegrated: true;
    tierOneInNetwork: SingleOOPProperties;
    tierTwoInNetwork: SingleOOPProperties;
    outNetwork: SingleOOPProperties;
    combined: SingleOOPProperties;    
} | {
    medicalDrugIntegrated: false;
    medicalTierOneInNetwork: SingleOOPProperties;
    medicalTierTwoInNetwork: SingleOOPProperties;
    medicalOutNetwork: SingleOOPProperties;
    medicalCombined: SingleOOPProperties;
    drugTierOneInNetwork: SingleOOPProperties;
    drugTierTwoInNetwork: SingleOOPProperties;
    drugOutNetwork: SingleOOPProperties;
    drugCombined: SingleOOPProperties;   
}

export type SingleTieredMaximumDeducitbleProperties = {
    medicalDrugIntegrated: true;
    inNetwork: SingleDeductiblePropertiesWithCoinsurance;
    outNetwork: SingleDeductibleProperties;
    combined: SingleDeductibleProperties;
} | {
    medicalDrugIntegrated: false;
    medicalInNetwork: SingleDeductiblePropertiesWithCoinsurance;
    medicalOutNetwork: SingleDeductibleProperties;
    medicalCombined: SingleDeductibleProperties;
    drugInNetwork: SingleDeductiblePropertiesWithCoinsurance;
    drugOutNetwork: SingleDeductibleProperties;
    drugCombined: SingleDeductibleProperties;
};

export type MultiTieredMaximumDeductibleProperties = {
    medicalDrugIntegrated: true;
    tierOneInNetwork: SingleDeductiblePropertiesWithCoinsurance;
    tierTwoInNetwork: SingleDeductiblePropertiesWithCoinsurance;
    outNetwork: SingleDeductibleProperties;
    combined: SingleDeductibleProperties;
} | {
    medicalDrugIntegrated: false;
    medicalTierOneInNetwork: SingleDeductiblePropertiesWithCoinsurance;
    medicalTierTwoInNetwork: SingleDeductiblePropertiesWithCoinsurance;
    medicalOutNetwork: SingleDeductibleProperties;
    medicalCombined: SingleDeductibleProperties;
    drugTierOneInNetwork: SingleDeductiblePropertiesWithCoinsurance;
    drugTierTwoInNetwork: SingleDeductiblePropertiesWithCoinsurance;
    drugOutNetwork: SingleDeductibleProperties;
    drugCombined: SingleDeductibleProperties;
}
