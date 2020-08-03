import { DentalPlanMetalLevel, NormalPlanMetalLevel, PlanDemographic, PlanType, StateCode } from '../../util/types';

/**
 * Plan attributes portion of the plan data as stored in the database.
 */
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
export type DentalOnlyDependentProperties =
    | {
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
          };
          deductible: {
              inNetwork: SingleDeductiblePropertiesWithCoinsurance;
              outNetwork: SingleDeductibleProperties;
              combined: SingleDeductibleProperties;
          };
      }
    | {
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
          };
          /**
           * URL for prescription drug formulary.
           */
          formularyUrl: string;
          /**
           * Maximum dollar value of coinsurance for specialty high-cost drugs.
           */
          specialtyDrugMaximumCoinsurance?: number;
          /**
           * Certain cost limits for EHR items.
           */
          costCeiling: CostCeilingProperties;
      };

type SingleOOPProperties = {
    individual?: number;
    familyPerPerson?: number;
    familyPerGroup?: number;
};

type SingleDeductibleProperties = {
    individual?: number;
    familyPerPerson?: number;
    familyPerGroup?: number;
};

type SingleDeductiblePropertiesWithCoinsurance = {
    coinsurance?: number;
} & SingleDeductibleProperties;

export type CostCeilingProperties =
    | {
          /**
           * Whether the in-network providers are multitiered.
           */
          isMultiTiered: false;
          oop: SingleTieredOOPProperties;
          deductible: SingleTieredMaximumDeducitbleProperties;
      }
    | {
          /**
           * Whether the in-network providers are multitiered.
           */
          isMultiTiered: true;
          oop: MultiTieredOOPProperties;
          deductible: MultiTieredMaximumDeductibleProperties;
      };

export type SingleTieredOOPProperties =
    | {
          /**
           * Whether medical cost ceilings and drug cost ceilings are the same.
           */
          medicalDrugIntegrated: true;
          inNetwork: SingleOOPProperties;
          outNetwork: SingleOOPProperties;
          combined: SingleOOPProperties;
      }
    | {
          /**
           * Whether medical cost ceilings and drug cost ceilings are the same.
           */
          medicalDrugIntegrated: false;
          medicalInNetwork: SingleOOPProperties;
          medicalOutNetwork: SingleOOPProperties;
          medicalCombined: SingleOOPProperties;
          drugInNetwork: SingleOOPProperties;
          drugOutNetwork: SingleOOPProperties;
          drugCombined: SingleOOPProperties;
      };

export type MultiTieredOOPProperties =
    | {
          /**
           * Whether medical cost ceilings and drug cost ceilings are the same.
           */
          medicalDrugIntegrated: true;
          tierOneInNetwork: SingleOOPProperties;
          tierTwoInNetwork: SingleOOPProperties;
          outNetwork: SingleOOPProperties;
          combined: SingleOOPProperties;
      }
    | {
          /**
           * Whether medical cost ceilings and drug cost ceilings are the same.
           */
          medicalDrugIntegrated: false;
          medicalTierOneInNetwork: SingleOOPProperties;
          medicalTierTwoInNetwork: SingleOOPProperties;
          medicalOutNetwork: SingleOOPProperties;
          medicalCombined: SingleOOPProperties;
          drugTierOneInNetwork: SingleOOPProperties;
          drugTierTwoInNetwork: SingleOOPProperties;
          drugOutNetwork: SingleOOPProperties;
          drugCombined: SingleOOPProperties;
      };

export type SingleTieredMaximumDeducitbleProperties =
    | {
          /**
           * Whether medical cost ceilings and drug cost ceilings are the same.
           */
          medicalDrugIntegrated: true;
          inNetwork: SingleDeductiblePropertiesWithCoinsurance;
          outNetwork: SingleDeductibleProperties;
          combined: SingleDeductibleProperties;
      }
    | {
          /**
           * Whether medical cost ceilings and drug cost ceilings are the same.
           */
          medicalDrugIntegrated: false;
          medicalInNetwork: SingleDeductiblePropertiesWithCoinsurance;
          medicalOutNetwork: SingleDeductibleProperties;
          medicalCombined: SingleDeductibleProperties;
          drugInNetwork: SingleDeductiblePropertiesWithCoinsurance;
          drugOutNetwork: SingleDeductibleProperties;
          drugCombined: SingleDeductibleProperties;
      };

export type MultiTieredMaximumDeductibleProperties =
    | {
          /**
           * Whether medical cost ceilings and drug cost ceilings are the same.
           */
          medicalDrugIntegrated: true;
          tierOneInNetwork: SingleDeductiblePropertiesWithCoinsurance;
          tierTwoInNetwork: SingleDeductiblePropertiesWithCoinsurance;
          outNetwork: SingleDeductibleProperties;
          combined: SingleDeductibleProperties;
      }
    | {
          /**
           * Whether medical cost ceilings and drug cost ceilings are the same.
           */
          medicalDrugIntegrated: false;
          medicalTierOneInNetwork: SingleDeductiblePropertiesWithCoinsurance;
          medicalTierTwoInNetwork: SingleDeductiblePropertiesWithCoinsurance;
          medicalOutNetwork: SingleDeductibleProperties;
          medicalCombined: SingleDeductibleProperties;
          drugTierOneInNetwork: SingleDeductiblePropertiesWithCoinsurance;
          drugTierTwoInNetwork: SingleDeductiblePropertiesWithCoinsurance;
          drugOutNetwork: SingleDeductibleProperties;
          drugCombined: SingleDeductibleProperties;
      };
