// This file includes utility types / constants used across the codebase.

export const DataSources = ['rate'] as const;
export type DataSource = typeof DataSources[number];


export const StateCodes = ['AK', 'AL', 'AR', 'AZ', 'DE', 'FL', 'GA', 'HI', 'IA', 'IL', 'IN',
'KS', 'KY', 'LA', 'ME', 'MI', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE',
'NH', 'NJ', 'NM', 'OH', 'OK', 'OR', 'PA', 'SC', 'SD', 'TN', 'TX',
'UT', 'VA', 'WI', 'WV', 'WY'] as const;
export type StateCode = typeof StateCodes[number];

export const PlanTypes = ['Indemnity', 'PPO', 'EPO', 'POS', 'HMO'] as const;
export type PlanType = typeof PlanTypes[number];

export const DentalPlanMetalLevels = ["high", "low"] as const;
export type DentalPlanMetalLevel = typeof DentalPlanMetalLevels[number];

export const NormalPlanMetalLevels = ['Silver', 'Expanded Bronze', 'Gold', 'Catastrophic', 'Platinum', 'Bronze'] as const;
export type NormalPlanMetalLevel = typeof NormalPlanMetalLevels[number];

export const CSRVariations = ['StandardOffExchange', 'StandardOnExchange', 'ZeroCostSharingPlan', 'LimitedCostSharingPlan', '73PercentSilverPlan', '87PercentSilverPlan', '94PercentSilverPlan'] as const;
export type CSRVariation = typeof CSRVariations[number];


