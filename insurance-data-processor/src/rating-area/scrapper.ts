import { Debugger } from "debug";
import cheerio from 'cheerio';
import axios from 'axios';
import { RatingAreaDataModel, ratingAreaDataModelSchema } from "./interface";
import { usaStates } from 'typed-usa-states';
import { StateCode } from "../insurance-data/util";
import ajv from "ajv";
import cliProgress from 'cli-progress';

const rootTableAddress = "https://www.cms.gov/CCIIO/Programs-and-Initiatives/Health-Insurance-Market-Reforms/state-gra";

export async function scrapeData(logger: Debugger) {
    logger("Fetching root data");
    const rootHtml = (await axios.get(rootTableAddress)).data;
    const rootDom = cheerio.load(rootHtml);
    const perStateTableAddress: {[stateName: string]: string} = {};

    rootDom("tbody > tr > td").filter((_, elem) => {
        return elem.children[0].name === "a";
    }).map((_, elem) => {
        return elem.children[0];
    }).each((_, elem) => {
        perStateTableAddress[elem.children[0].data!] = `https://www.cms.gov/${elem.attribs.href}`;
    });

    const data: RatingAreaDataModel[] = new Array();
    const emptyStringRegex = /^\s*$/.compile();

    logger("Processing per state data");
    let progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(Object.keys(perStateTableAddress).length, 0);

    for (const [stateName, url] of Object.entries(perStateTableAddress)) {
        const stateCode = stateName === "US Virgin Islands" ? "VI" : usaStates.find(stateInfo => stateInfo.name === stateName)!.abbreviation as StateCode;

        const statePageHtml = (await axios.get(url)).data;
        const statePageDom = cheerio.load(statePageHtml);
        statePageDom("tbody > tr").filter(id => id !== 0)
            .each((i, elem) => {
                const [ratingAreaCell, countyNameCell, zipcodeCell] = elem.children;

                try {
                    const ratingAreaId = parseInt((ratingAreaCell.children[0]?.children?.[0] ?? ratingAreaCell.children[0]).data!.split(' ')[2]).toString();
                    const countyName = (countyNameCell.children[0]?.children?.[0] ?? ratingAreaCell.children[0]).data!;
                    const zipcode = (zipcodeCell.children[0]?.children?.[0] ?? ratingAreaCell.children[0]).data!;

                
                    const datum = data.find(val => val.state === stateCode && val.ratingAreaId === ratingAreaId)
                        ?? (() => {
                            const datum = {
                                state: stateCode,
                                ratingAreaId,
                                counties: [],
                                zipcodes: [],
                            };
                            data.push(datum);
                            return datum;
                        })();

                    if (!emptyStringRegex.test(countyName)) {
                        datum.zipcodes.push(zipcode);
                    } else {
                        datum.counties.push(countyName);
                    }
                } catch (e) {
                    console.log(i, stateName);
                    throw e;
                }  
                
                /*
                const datum = data.find(val => val.state === stateCode && val.ratingAreaId === ratingAreaId)
                    ?? (() => {
                        const datum = {
                            state: stateCode,
                            ratingAreaId,
                            counties: [],
                            zipcodes: [],
                        };
                        data.push(datum);
                        return datum;
                    })();

                if (!emptyStringRegex.test(countyName)) {
                    datum.zipcodes.push(zipcode);
                } else {
                    datum.counties.push(countyName);
                } */
            });

        progressBar.increment();
    }

    progressBar.stop();
    logger("Validating data");
    progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(data.length, 0);

    const validator = new ajv();
    validator.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
    const validate = validator.compile(ratingAreaDataModelSchema); 

    Object.values(data).forEach(datum => {
        const valid = validate(datum);
        if (!valid) {
            throw validate.errors;
        }
        progressBar.increment();
    });

    progressBar.stop();
    return data;
}