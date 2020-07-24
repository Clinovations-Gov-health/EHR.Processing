import { CostSharingPreprocessModel } from "src/preprocess/interface/cost-sharing";
import { PlanAttributePreprocessModel } from "src/preprocess/interface/plan-attribute";
import { RatePreprocessModel } from "src/preprocess/interface/rate";

/**
 * Shape of the plan as stored in the database.
 */
export type Plan = CostSharingPreprocessModel & PlanAttributePreprocessModel & RatePreprocessModel;