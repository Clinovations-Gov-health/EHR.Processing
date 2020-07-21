import { getData } from "./source/source";
import { preprocess } from "./preprocess/preprocess";

async function main() {
    const data = await getData("rate");
    await preprocess("rate", data);
}

main();