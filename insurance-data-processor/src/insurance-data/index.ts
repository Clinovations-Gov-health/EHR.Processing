import loggerFactory, { Debugger } from 'debug';
import cliProgress from 'cli-progress';
import * as fs from 'fs';
import { Config } from '../config';
import { join, addToDatabase } from './join/join';
import { getData } from './source/source';
import { preprocess } from './preprocess/preprocess';
import { RatePreprocessModel } from './preprocess/interface/rate';
import { PlanAttributePreprocessModel } from './preprocess/interface/plan-attribute';
import { CostSharingPreprocessModel } from './preprocess/interface/cost-sharing';
import { DataSource } from './util';
import JsonStreamStringify from 'json-stream-stringify';

async function main() {
    const logger = loggerFactory("main");
    const config = new Config();

    const rateData = await process('rate', logger);
    global.gc();
    const costSharingData = await process("costSharing", logger);
    global.gc();
    const attributesData = await process('attributes', logger);
    
    const res = await join(rateData, attributesData, costSharingData, logger);

    logger("Writing final data to file");
    await writeToFile(res, "data/final.json");

    logger("Loading the data into the database");
    await addToDatabase(config.mongoDbAddress, Object.values(res));
}

async function process(dataType: "rate", logger: Debugger): Promise<Record<string, RatePreprocessModel>>;
async function process(dataType: "attributes", logger: Debugger): Promise<Record<string, PlanAttributePreprocessModel>>;
async function process(dataType: "costSharing", logger: Debugger): Promise<Record<string, CostSharingPreprocessModel>>;
async function process(dataType: DataSource, logger: Debugger) {
    logger(`Now Processing: ${dataType} data`);
    const data = await getData(dataType, logger);
    const res = await preprocess(dataType, data, logger);

    return res;
}

async function writeToFile(data: any, fileName: string): Promise<void> {
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(Object.keys(data).length, 0);

    await new Promise(resolve => {
        const fsStream = fs.createWriteStream(fileName);
        const readKeys = new Set<string>();
        const jsonStream = new JsonStreamStringify(data, undefined, 4);
        jsonStream.on('data', data => {
            const currPath = jsonStream.path();
            if (currPath.length as number === 1 && !readKeys.has(currPath[0])) {
                readKeys.add(currPath[0]);
                progressBar.increment();
            }
            fsStream.write(data);
        });
        jsonStream.on('close', () => {
            fsStream.close();
            progressBar.stop();
            resolve();
        })
    });
}

export = main;