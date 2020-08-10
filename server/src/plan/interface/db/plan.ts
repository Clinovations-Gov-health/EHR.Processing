import { CostSharingPreprocessModel } from './cost-sharing';
import { PlanAttributePreprocessModel } from './plan-attribute';
import { RatePreprocessModel } from './rate';

/**
 * Shape of the plan as stored in the database.
 */
export type Plan = CostSharingPreprocessModel & PlanAttributePreprocessModel & RatePreprocessModel;