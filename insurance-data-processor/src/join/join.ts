import cliProgress from 'cli-progress';
import { Debugger } from "debug";
import { ceil, chunk, mapValues } from "lodash";
import { MongoClient } from "mongodb";
import { CostSharingPreprocessModel } from "src/preprocess/interface/cost-sharing";
import { PlanAttributePreprocessModel } from "src/preprocess/interface/plan-attribute";
import { RatePreprocessModel } from "src/preprocess/interface/rate";
import { assertEquals } from 'typescript-is';
import { Plan } from "./model";

export async function join(ratesData: Record<string, RatePreprocessModel>, attributesData: Record<string, PlanAttributePreprocessModel>, costSharingData: Record<string, CostSharingPreprocessModel>, logger: Debugger) {
    logger("Joining data");
    let progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
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

    logger("Validating data");
    progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(Object.keys(res).length, 0);

    Object.values(res).forEach(val => {
        assertEquals<Plan>(val);
        progressBar.increment();
    })

    progressBar.stop();
    return res;
}

export async function addToDatabase(data: Plan[]) {
    const client = await MongoClient.connect("mongodb://localhost:27017/Clinovations?replicaSet=rs0");
    const db = client.db('Clinovations');
    const collection = db.collection('Plan');

    const planChunks = chunk(data, 10);
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(ceil(data.length / 10), 0);

    for (const chunk of planChunks) {
        await collection.insertMany(chunk);
        progressBar.increment();
    }

    progressBar.stop();
    client.close();
}