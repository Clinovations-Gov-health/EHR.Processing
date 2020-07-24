import { getData } from "./source/source";
import { preprocess } from "./preprocess/preprocess";
import fs from "fs";
import JsonStreamStringify from 'json-stream-stringify';
import cliProgress from 'cli-progress';

import loggerFactory, { Debugger } from 'debug';
import { DataSource } from "./util";
import { join } from './join/join';
import { RatePreprocessModel } from "./preprocess/interface/rate";
import { CostSharingPreprocessModel } from "./preprocess/interface/cost-sharing";
import { PlanAttributePreprocessModel } from "./preprocess/interface/plan-attribute";

async function main() {
    const logger = loggerFactory("main");

    const costSharingData = await process("costSharing", logger);
    global.gc();
    const rateData = await process('rate', logger);
    global.gc();
    const attributesData = await process('attributes', logger);
    
    join(rateData, attributesData, costSharingData, logger);
}

async function process(dataType: "rate", logger: Debugger): Promise<Record<string, RatePreprocessModel>>;
async function process(dataType: "attributes", logger: Debugger): Promise<Record<string, PlanAttributePreprocessModel>>;
async function process(dataType: "costSharing", logger: Debugger): Promise<Record<string, CostSharingPreprocessModel>>;
async function process(dataType: DataSource, logger: Debugger) {
    logger(`Now Processing: ${dataType} data`);
    const data = await getData(dataType, logger);
    const res = await preprocess(dataType, data, logger);

    // write data to file
    logger("Writing data to file");
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(Object.keys(res).length, 0);

    await new Promise(resolve => {
        const fsStream = fs.createWriteStream(`data/${dataType}.json`);
        const readKeys = new Set<string>();
        const jsonStream = new JsonStreamStringify(res)
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

    logger(`Process Complete: ${dataType} data`);
    return res;
}

main();