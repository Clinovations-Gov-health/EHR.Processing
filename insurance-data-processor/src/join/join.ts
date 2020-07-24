import { RatePreprocessModel } from "src/preprocess/interface/rate";
import { PlanAttributePreprocessModel } from "src/preprocess/interface/plan-attribute";
import { CostSharingPreprocessModel } from "src/preprocess/interface/cost-sharing";
import cliProgress from 'cli-progress';
import { Debugger } from "debug";
import { mapValues } from "lodash";
import { Plan } from "./model";

export async function join(ratesData: Record<string, RatePreprocessModel>, attributesData: Record<string, PlanAttributePreprocessModel>, costSharingData: Record<string, CostSharingPreprocessModel>, logger: Debugger) {
    logger("Joining data");
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(Object.keys(costSharingData).length, 0);

    const res: Record<string, Plan> = mapValues(costSharingData, (costSharingInfo, id) => {
        progressBar.increment();
        return {
            ...costSharingInfo,
            ...attributesData[id],
            ...ratesData[costSharingInfo.standardComponentId],
        };
    });

    progressBar.stop();

    return res;
}