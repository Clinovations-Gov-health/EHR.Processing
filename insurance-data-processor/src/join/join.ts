import cliProgress from 'cli-progress';
import { Debugger } from "debug";
import { ceil, chunk, mapValues } from "lodash";
import { MongoClient } from "mongodb";
import { CostSharingPreprocessModel } from "../preprocess/interface/cost-sharing";
import { PlanAttributePreprocessModel } from "../preprocess/interface/plan-attribute";
import { RatePreprocessModel } from "../preprocess/interface/rate";
import { Plan, planSchema } from "./model";
import ajv from 'ajv';

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

    const validator = new ajv();
    validator.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
    const validate = validator.compile(planSchema);

    Object.values(res).map(plan => {
        const valid = validate(plan);
        if (!valid) {
            throw validate.errors;
        }
        progressBar.increment();
    });

    progressBar.stop();
    return res;
}

export async function addToDatabase(dbAddress: string, data: Plan[]) {
    const client = await MongoClient.connect(dbAddress, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    });
    const db = client.db('Clinovations');
    const collection = db.collection('Plan');

    // resets the collection
    await collection.deleteMany({});
    
    // sets the indices
    await collection.createIndexes([
        { key: { standardComponentId: 1, variantId: 1 }, name: "planId", unique: true },
        { key: { isDentalOnly: 1, stateCode: 1, isIndividual: 1, demographics: 1 }, name: "query" },
    ]);

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