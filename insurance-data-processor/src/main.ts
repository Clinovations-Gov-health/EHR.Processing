import { convert, preprocess } from "./data/process";
import { promises as fs } from 'fs';
import { loadInsurancePlanData } from './db/db';

async function process() {
    const tempFileName = "temp.json";
    preprocess('data/individual-plans.csv', tempFileName);
    const res = await convert("temp.json")
    await fs.writeFile("data/final.json", JSON.stringify(res));
    await fs.unlink(tempFileName);
}

async function intoDb() {
    const filePath = "data/final.json";
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    await loadInsurancePlanData(data);
    await fs.unlink(filePath);
}

async function main() {
    await process();
    await intoDb();
}

main();