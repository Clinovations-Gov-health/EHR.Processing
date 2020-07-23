import { getData } from "./source/source";
import { preprocess } from "./preprocess/preprocess";
import { writeFileSync } from "fs";

async function main() {
    const data = await getData("costSharing");
    global.gc();
    const res = await preprocess("costSharing", data);
    writeFileSync("data/costSharing.json", JSON.stringify(res, null, 4));
}

main();