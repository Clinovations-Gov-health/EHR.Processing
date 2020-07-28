import { CostSharingPreprocessModel } from "../preprocess/interface/cost-sharing";
import { PlanAttributePreprocessModel } from "../preprocess/interface/plan-attribute";
import { RatePreprocessModel } from "../preprocess/interface/rate";
import { JSONSchema6Definition } from 'json-schema';
import { StateCodes, PlanTypes, PlanDemographics, DentalPlanMetalLevels, NormalPlanMetalLevels, BenefitItemLimitUnits, BenefitItemLimitFrequencies, BenefitItemCostSharingDeductibleStatuses, BenefitItemCostSharingFrequencies } from "../util";

/**
 * Shape of the plan as stored in the database.
 */
export type Plan = CostSharingPreprocessModel & PlanAttributePreprocessModel & RatePreprocessModel;

/**
 * Cast a readonly array to a mutable one. This function breaks the type safety.
 */
function mutable<T>(val: ReadonlyArray<T>): Array<T> {
    return val as unknown as Array<T>;
}

const planAttributesBaseSchema: JSONSchema6Definition = {
    type: "object",
    properties: {
        // plan attributes
        stateCode: { type: "string", enum: mutable(StateCodes) },
        issuerId: { type: "string", minLength: 5, maxLength: 5 },
        isIndividual: { type: "boolean" },
        marketingName: { type: "string" },
        planType: { type: "string", enum: mutable(PlanTypes) },
        planLevelExclusions: { type: "string" },
        demographics: { type: "string", enum: mutable(PlanDemographics) },
        isGuaranteed: { type: "boolean" },
        nationalNetwork: { type: "boolean" },
        variationType: { type: "string" },
        inPatientCopaymentMaximumDays: { type: "integer" },
        beginPrimaryCareCostSharingAfterNumberOfVisits: { type: "integer" },
        beginPrimaryCareDeductibleCoinsuranceAfterNumberOfCopays: { type: "integer" },
        brochureUrl: { type: "string" },
    },
    required: [ "stateCode", "issuerId", "isIndividual", "marketingName", "planType", "demographics", "isGuaranteed", "nationalNetwork", "variationType" ],
};

const planAttributesSingleOOPDeductiblePropertiesSchema: JSONSchema6Definition = {
    type: "object",
    properties: {
        individual: { type: "number" },
        familyPerPerson: { type: "number" },
        familyPerGroup: { type: "number" },
    },
};

const planAttributesSingleDeductiblePropertiesWithCoinsuranceSchema: JSONSchema6Definition = {
    allOf: [
        planAttributesSingleOOPDeductiblePropertiesSchema,
        {
            type: "object",
            properties: { coinsurance: { type: "number" } },
        },
    ],
};

const planAttributesDentalOnlySchema: JSONSchema6Definition = {
    type: "object",
    properties: {
        isDentalOnly: { type: "boolean", const: true },
        metalLevel: { type: "string", enum: mutable(DentalPlanMetalLevels) },
        oop: {
            type: "object",
            properties: {
                inNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                outNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                combined: planAttributesSingleOOPDeductiblePropertiesSchema,
            },
            required: ["inNetwork", "outNetwork", "combined"],
        },
        deductible: {
            type: "object",
            properties: {
                inNetwork: planAttributesSingleDeductiblePropertiesWithCoinsuranceSchema,
                outNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                combined: planAttributesSingleOOPDeductiblePropertiesSchema,
            },
            required: ["inNetwork", "outNetwork", "combined"],
        },
    },
    required: ["isDentalOnly", "metalLevel", "oop", "deductible"],
}

const costCeilingPropertiesSchema: JSONSchema6Definition = {
    oneOf: [
        {
            type: "object",
            properties: {
                isMultiTiered: { type: "boolean", const: false },
                oop: { 
                    oneOf: [
                        {
                            type: "object",
                            properties: {
                                medicalDrugIntegrated: { type: "boolean", const: true },
                                inNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                                outNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                                combined: planAttributesSingleOOPDeductiblePropertiesSchema,
                            },
                            required: ["medicalDrugIntegrated", "inNetwork", "outNetwork", "combined"],
                        },
                        {
                            type: "object",
                            properties: {
                                medicalDrugIntegrated: { type: "boolean", const: false },
                                medicalInNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                                medicalOutNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                                medicalCombined: planAttributesSingleOOPDeductiblePropertiesSchema,
                                drugInNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                                drugOutNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                                drugCombined: planAttributesSingleOOPDeductiblePropertiesSchema,
                            },
                            required: ["medicalDrugIntegrated", "medicalInNetwork", "medicalOutNetwork", "medicalCombined", "drugInNetwork", "drugOutNetwork", "drugCombined"],
                        },
                    ],
                },
                deductible: {
                    oneOf: [
                        {
                            type: "object",
                            properties: {
                                medicalDrugIntegrated: { type: "boolean", const: true },
                                inNetwork: planAttributesSingleDeductiblePropertiesWithCoinsuranceSchema,
                                outNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                                combined: planAttributesSingleOOPDeductiblePropertiesSchema,
                            },
                            required: ["medicalDrugIntegrated", "inNetwork", "outNetwork", "combined"],
                        },
                        {
                            type: "object",
                            properties: {
                                medicalDrugIntegrated: { type: "boolean", const: false },
                                medicalInNetwork: planAttributesSingleDeductiblePropertiesWithCoinsuranceSchema,
                                medicalOutNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                                medicalCombined: planAttributesSingleOOPDeductiblePropertiesSchema,
                                drugInNetwork: planAttributesSingleDeductiblePropertiesWithCoinsuranceSchema,
                                drugOutNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                                drugCombined: planAttributesSingleOOPDeductiblePropertiesSchema,
                            },
                            required: ["medicalDrugIntegrated", "medicalInNetwork", "medicalOutNetwork", "medicalCombined", "drugInNetwork", "drugOutNetwork", "drugCombined"],
                        },
                    ],
                },
            },
            required: ["isMultiTiered", "oop", "deductible"],
        },
        {
            type: "object",
            properties: {
                isMultiTiered: { type: "boolean", const: true },
                oop: {
                    oneOf: [
                        {
                            type: "object",
                            properties: {
                                medicalDrugIntegrated: { type: "boolean", const: true },
                                tierOneInNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                                tierTwoInNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                                outNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                                combined: planAttributesSingleOOPDeductiblePropertiesSchema,
                            },
                            required: ["medicalDrugIntegrated", "tierOneInNetwork", "tierTwoInNetwork", "outNetwork", "combined"],
                        },
                        {
                            type: "object",
                            properties: {
                                medicalDrugIntegrated: { type: "boolean", const: false },
                                medicalTierOneInNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                                medicalTierTwoInNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                                medicalOutNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                                medicalCombined: planAttributesSingleOOPDeductiblePropertiesSchema,
                                drugTierOneInNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                                drugTierTwoInNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                                drugOutNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                                drugCombined: planAttributesSingleOOPDeductiblePropertiesSchema,
                            },
                            required: ["medicalDrugIntegrated", "medicalTierOneInNetwork", "medicalTierTwoInNetwork", "medicalOutNetwork", "medicalCombined", "drugTierOneInNetwork", "drugTierTwoInNetwork", "drugOutNetwork", "drugCombined"],
                        },
                    ],
                },
                deductible: {                     
                    oneOf: [
                        {
                            type: "object",
                            properties: {
                                medicalDrugIntegrated: { type: "boolean", const: true },
                                tierOneInNetwork: planAttributesSingleDeductiblePropertiesWithCoinsuranceSchema,
                                tierTwoInNetwork: planAttributesSingleDeductiblePropertiesWithCoinsuranceSchema,
                                outNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                                combined: planAttributesSingleOOPDeductiblePropertiesSchema,
                            },
                            required: ["medicalDrugIntegrated", "tierOneInNetwork", "tierTwoInNetwork", "outNetwork", "combined"],
                        },
                        {
                            type: "object",
                            properties: {
                                medicalDrugIntegrated: { type: "boolean", const: false },
                                medicalTierOneInNetwork: planAttributesSingleDeductiblePropertiesWithCoinsuranceSchema,
                                medicalTierTwoInNetwork: planAttributesSingleDeductiblePropertiesWithCoinsuranceSchema,
                                medicalOutNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                                medicalCombined: planAttributesSingleOOPDeductiblePropertiesSchema,
                                drugTierOneInNetwork: planAttributesSingleDeductiblePropertiesWithCoinsuranceSchema,
                                drugTierTwoInNetwork: planAttributesSingleDeductiblePropertiesWithCoinsuranceSchema,
                                drugOutNetwork: planAttributesSingleOOPDeductiblePropertiesSchema,
                                drugCombined: planAttributesSingleOOPDeductiblePropertiesSchema,
                            },
                            required: ["medicalDrugIntegrated", "medicalTierOneInNetwork", "medicalTierTwoInNetwork", "medicalOutNetwork", "medicalCombined", "drugTierOneInNetwork", "drugTierTwoInNetwork", "drugOutNetwork", "drugCombined"],
                        },
                    ]
                },
            },
            required: ["isMultiTiered", "oop", "deductible"],
        },
    ],
};

const planAttributesNonDentalOnlySchema: JSONSchema6Definition = {
    type: "object",
    properties: {
        isDentalOnly: { type: "boolean", const: false },
        metalLevel: { type: "string", enum: mutable(NormalPlanMetalLevels) },
        formularyId: { type: "string" },
        dmp: {
            type: "object",
            properties: {
                wellness: { type: "boolean" },
                asthma: { type: "boolean" },
                heartDisease: { type: "boolean" },
                depression: { type: "boolean" },
                diabetes: { type: "boolean" },
                highBloodPressureAndHighCholesterol: { type: "boolean" },
                lowBackPain: { type: "boolean" },
                painManagement: { type: "boolean" },
                pregnancy: { type: "boolean" },
                weightLoss: { type: "boolean" },
            },
            required: ["wellness", "asthma", "heartDisease", "depression", "diabetes", "highBloodPressureAndHighCholesterol", "lowBackPain", "painManagement", "pregnancy", "weightLoss"],
        },
        formularyUrl: { type: "string" },
        specialtyDrugMaximumCoinsurance: { type: "number" },
        costCeiling: costCeilingPropertiesSchema,
    },
    required: ["isDentalOnly", "metalLevel", "formularyId", "dmp", "formularyUrl", "costCeiling"],
}

const benefitItemCostSharingSchema: JSONSchema6Definition = {
    oneOf: [
        {
            type: "object",
            properties: {
                amount: { type: "number" },
                isPercent: { type: "boolean", const: false },
                deductibleStatus: { type: "string", enum: mutable(BenefitItemCostSharingDeductibleStatuses) },
                frequency: { type: "string", enum: mutable(BenefitItemCostSharingFrequencies) },
            },
            required: ["amount", "isPercent", "deductibleStatus", "frequency"],
        },
        {
            type: "object",
            properties: {
                amount: { type: "number" },
                isPercent: { type: "boolean", const: true },
                deductibleStatus: { type: "string", enum: mutable(BenefitItemCostSharingDeductibleStatuses) },        
            },
            required: ["amount", "isPercent", "deductibleStatus"],
        },
    ],
};

export const planSchema: JSONSchema6Definition = {
    definitions: {
        shared: {
            type: "object",
            properties: {
                standardComponentId: { type: "string" },
                variantId: { type: "string", minLength: 2, maxLength: 2 },                
            },
            required: [ "standardComponentId", "variantId" ],
        },
        planAttributes: {
            allOf: [
                planAttributesBaseSchema,
                {
                    oneOf: [
                        planAttributesDentalOnlySchema,
                        planAttributesNonDentalOnlySchema,
                    ],
                },
            ],
        },
        rate: {
            type: "object",
            properties: {
                rateDetail: {
                    type: "object",
                    additionalProperties: {
                        oneOf: [
                            {
                                type: "object",
                                properties: {
                                    target: { type: "string", const: "individual" },
                                    rate: { type: "array", items: { type: "number" }, minItems: 51, maxItems: 51 },
                                    tobaccoRate: { type: "array", items: { type: "number" }, minItems: 51, maxItems: 51 },
                                },
                                required: ["target", "rate", "tobaccoRate"],
                            },
                            {
                                type: "object",
                                properties: {
                                    target: { type: "string", const: "family" },
                                    individual: { type: "array", items: { type: "number" }, minItems: 4, maxItems: 4 },
                                    couple: { type: "array", items: { type: "number" }, minItems: 4, maxItems: 4 },
                                },
                                required: ["target", "individual", "couple"],
                            },
                        ],
                    },
                },
            },
            required: ["rateDetail"],
        },
        costSharing: {
            type: "object",
            properties: {
                benefits: {
                    additionalProperties: {
                        oneOf: [
                            { type: "object", properties: { covered: { type: "boolean", const: false } }, required: ["covered"] },
                            {
                                type: "object",
                                properties: {
                                    covered: { type: "boolean", const: true },
                                    exclusions: { type: "string" },
                                    explanations: { type: "string" },
                                    limit: {
                                        type: "object",
                                        properties: {
                                            quantity: { type: "number" },
                                            unit: { type: "string", enum: mutable(BenefitItemLimitUnits) },
                                            frequencyNum: { type: "number" },
                                            frequencyUnit: { type: "string", enum: mutable(BenefitItemLimitFrequencies) },
                                        },
                                        required: ["quantity", "unit", "frequencyNum", "frequencyUnit"],
                                    },
                                    ehbInfo: {
                                        type: "object",
                                        properties: {
                                            isExcludedFromInNetworkMOOP: { type: "boolean" },
                                            isExcludedFromOutOfNetworkMOOP: { type: "boolean" },
                                        },
                                        required: ["isExcludedFromInNetworkMOOP", "isExcludedFromOutOfNetworkMOOP"],
                                    },
                                    inNetworkTierOne: {
                                        type: "array",
                                        items: benefitItemCostSharingSchema,
                                        minItems: 1,
                                        maxItems: 2,
                                    },
                                    inNetworkTierTwo: {
                                        type: "array",
                                        items: benefitItemCostSharingSchema,
                                        minItems: 1,
                                        maxItems: 2,
                                    },
                                    outOfNetwork: {
                                        type: "array",
                                        items: benefitItemCostSharingSchema,
                                        minItems: 1,
                                        maxItems: 2,
                                    },
                                },
                                required: ["covered", "inNetworkTierOne", "outOfNetwork"],
                            },
                        ],
                    }
                },
            },
            required: ["benefits"],
        },
    },
    allOf: [
        { $ref: "#/definitions/shared" },
        { $ref: "#/definitions/planAttributes" },
        { $ref: "#/definitions/rate" },
        { $ref: "#/definitions/costSharing" },
    ],
};