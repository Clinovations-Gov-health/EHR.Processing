// This file includes utility types / constants used across the codebase.

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
