
/**
 * Shape of the raw CSV table data for plan attributes.
 */
export interface RawRateModel {
    PlanId: string;
    RatingAreaId: string;
    Tobacco?: string;
    Age: string;
    IndividualRate: string;
    IndividualTobaccoRate?: string;
    Couple?: string;
    PrimarySubscriberAndOneDependent?: string;
    PrimarySubscriberAndTwoDependents?: string;
    PrimarySubscriberAndThreeOrMoreDependents?: string;
    CoupleAndOneDependent?: string;
    CoupleAndTwoDependents?: string;
    CoupleAndThreeOrMoreDependents?: string;
}

/**
 * Shape of the rate table after preprocessing.
 */
export interface RatePreprocessModel {
    /**
     * Id of the standard component of the plan.
     */
    standardComponentId: string;
    /**
     * Detail of the rates. This is a map of rating area to the rates specific to that area.
     */
    rateDetail: {[area: number]: {
        /**
         * The plan only has an individual component. Plan rates are determined by age and tobacco usage.
         */
        type: "individual",
        /**
         * Rate for individual with no tobacco usage. The first entry is rate for age 14 or lower; last entry is rate for age 64 and over.
         *
         * Certain plans that are adult-only or children-only include nonsensical values for age brackets that the plans don't cover. These nonsensical values
         * persist here and will be filtered out later during the merging step.
         */
        rate: number[],
        /**
         * Rate for individual with tobacco usage. The first entry is rate for age 14 or lower; last entry is rate for age 64 and over.
         *
         * Certain plans that are adult-only or children-only include nonsensical values for age brackets that the plans don't cover. These nonsensical values
         * persist here and will be filtered out later during the merging step.
         */
        tobaccoRate: number[],
    } | {
        /**
         * The plan has an individual and family component. Plan rates are determined by number of spouses and dependents only.
         */
        type: "family",
        /**
         * Rates for an individual with 0, 1, 2, 3 dependents.
         */
        individual: [number, number, number, number];
        /**
         * Rates for a couple with 0, 1, 2, 3 dependents.
         */
        couple: [number, number, number, number];
    }},
}