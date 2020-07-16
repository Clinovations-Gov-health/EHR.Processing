"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const process_1 = require("./data/process");
const fs_1 = require("fs");
const db_1 = require("./db/db");
async function process() {
    const tempFileName = "temp.json";
    process_1.preprocess('data/individual-plans.csv', tempFileName);
    const res = await process_1.convert("temp.json");
    await fs_1.promises.writeFile("data/final.json", JSON.stringify(res));
    await fs_1.promises.unlink(tempFileName);
}
async function intoDb() {
    const filePath = "data/final.json";
    const data = JSON.parse(await fs_1.promises.readFile(filePath, 'utf-8'));
    await db_1.loadInsurancePlanData(data);
}
async function main() {
    await intoDb();
}
main();
//# sourceMappingURL=main.js.map