import { CostSharingPreprocessModel } from "../preprocess/interface/cost-sharing";
import { PlanAttributePreprocessModel } from "../preprocess/interface/plan-attribute";
import { RatePreprocessModel } from "../preprocess/interface/rate";

/**
 * Shape of the plan as stored in the database.
 */
export type Plan = CostSharingPreprocessModel & PlanAttributePreprocessModel & RatePreprocessModel;