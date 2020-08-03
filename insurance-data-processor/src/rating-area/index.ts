import { Config } from "../config";
import loggerFactory from 'debug';
import { scrapeData } from "./scrapper";
import { loadDataIntoDb } from "./db";

async function main() {
    const logger = loggerFactory("main");
    const config = new Config();

    const data = await scrapeData(logger);
    await loadDataIntoDb(config.mongoDbAddress, data, logger);
}

export = main;