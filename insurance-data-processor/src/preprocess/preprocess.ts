import dataForge = require("data-forge");
import "data-forge-fs";
import { writeFileSync } from "fs";
import { isEmpty } from "lodash";
import { RatePreprocessModel } from "./interface/rate";

export type PreprocessDataType = "rate";

export async function preprocess(type: PreprocessDataType, data: Buffer) {
    switch (type) {
        case 'rate':
            return await preprocessRateData(data);
    }
}

async function preprocessRateData(data: Buffer) {
    /**
     * Useless columns for our purpose. To be dropped in data processing.
     */
    const COLUMNS_TO_DROP = ["SourceName", "ImportDate", "FederalTIN", "RateEffectiveDate", "RateExpirationDate", "BusinessYear"];
    /**
     * Columns containing numbers. Will be converted from number strings to numbers during processing.
     */
    const NUMBER_COLUMNS = ["IndividualRate", "IndividualTobaccoRate", "Couple", "PrimarySubscriberAndOneDependent", "PrimarySubscriberAndTwoDependents", "PrimarySubscriberAndThreeOrMoreDependents", "CoupleAndOneDependent", "CoupleAndTwoDependents", "CoupleAndThreeOrMoreDependents"]

    const ratingAreaStringRegex = /^Rating Area (\d{1,2})$/;

    const result = dataForge.fromCSV(data.toString('utf-8'))
        .dropSeries(COLUMNS_TO_DROP)
        .parseFloats(NUMBER_COLUMNS)
        .transformSeries({
            "RatingAreaId": (value, index) => {
                const matches = ratingAreaStringRegex.exec(value);
                if (!matches || isEmpty(matches)) {
                    throw `RatingAreaId on row ${index} has invalid value ${value}`;
                }

                const res = parseInt(matches[0][1]);
                if (!res) {
                    throw `RatingAreaId on row ${index} has invalid value ${value}`;
                }

                return res;
            },
        })
        .aggregate<Map<string, RatePreprocessModel>>({}, (prev, row) => {
            if (!prev.has(row.PlanId)) {
                prev.set(row.PlanId, {
                    stateCode: row.StateCode,
                    issuerId: row.IssuerId,
                    planId: row.PlanId,
                    rateDetail: {},
                });
            }

            const plan = prev.get(row.PlanId)!;
            const isFamilyPlan = row.Age === "Family Option";
            if (!Reflect.has(plan.rateDetail, row.RatingAreaId)) {
                // If the plan doesn't have rate detail corresponding to this rating area, we create the detail.
                // On family plans, there can only be one entry in the data table for this rating area, so we initialize it
                // in one go. For individual plans, we simply initializes the rate arrays filled with undefined.
                plan.rateDetail[row.RatingAreaId] = isFamilyPlan
                    ? {
                        type: "family",
                        individual: [
                            row.IndividualRate,
                            row.PrimarySubscriberAndOneDependent,
                            row.PrimarySubscriberAndTwoDependents,
                            row.PrimarySubscriberAndThreeOrMoreDependents,
                        ],
                        couple: [
                            row.Couple,
                            row.CoupleAndOneDependent,
                            row.CoupleAndTwoDependents,
                            row.CoupleAndThreeOrMoreDependents
                        ],
                    } : {
                        type: "individual",
                        rate: Array(51).fill(undefined),
                        tobaccoRate: Array(51).fill(undefined),
                    };
            }

            if (!isFamilyPlan) {
                let ageIndex: number;
                switch (row.Age) {
                    case "0-14":
                        ageIndex = 0;
                        break;

                    case "64 and over":
                        ageIndex = 50;
                        break;

                    default:
                        ageIndex = parseInt(row.Age) - 14;
                }

                const rateDetail = plan.rateDetail[row.RatingAreaId];
                if (rateDetail.type !== 'individual') {
                    throw "Invalid code path.";
                }

                rateDetail.rate[ageIndex] = row.IndividualRate;
                rateDetail.tobaccoRate[ageIndex] = !row.Tobacco || row.Tobacco === "No Preference"
                    ? row.IndividualRate
                    : row.IndividualTobaccoRate;
            }

            return prev;
        });

    writeFileSync("result.json", JSON.stringify(result));
    return result;
}