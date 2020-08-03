import { argv } from 'yargs';
import processInsuranceData from './insurance-data';
import processRatingAreaData from './rating-area';

async function main() {
    if (argv.i) {
        await processInsuranceData();
    }
    if (argv.r) {
        console.log(processRatingAreaData);
        await processRatingAreaData();
    }
}

main();