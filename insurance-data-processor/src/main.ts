import { getData } from "./source/source";
import { preprocess } from "./preprocess/preprocess";
import { writeFileSync } from "fs";

async function main() {
    const data = await getData("attributes");
    global.gc();
    const res = await preprocess("attributes", data);
    writeFileSync("attributes.json", JSON.stringify(res, null, 4));
}

main();