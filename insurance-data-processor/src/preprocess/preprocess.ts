import dataForge = require("data-forge");
import "data-forge-fs";
import { isEmpty } from "lodash";
import { Pool, spawn, Worker } from "threads";
import { DataSource, StateCode } from "../util";
import { RawAttributeModel } from "./interface/plan-attribute";
import { RatePreprocessModel, RawRateModel } from "./interface/rate";
import { PreprocessWorker } from "./preprocess-worker";
import { RawCostSharingModel } from "./interface/cost-sharing";

export async function preprocess(type: DataSource, data: Buffer) {
    switch (type) {
        case 'rate':
            return await preprocessRateData(data);

        case 'attributes':
            return await preprocessAttributesData(data);

        case 'costSharing':
            return await preprocessCostSharingData(data);
    }
}

async function preprocessCostSharingData(data: Buffer) {
    const COLUMNS_TO_DROP = ["BusinessYear", "StateCode", "IssuerId", "SourceName", "ImportDate", "StandardComponentId", "EHBVarReason"];

    const dfChunkJsonStrings = dataForge.fromCSV(data.toString('utf-8'))
        .dropSeries<RawCostSharingModel>(COLUMNS_TO_DROP)
        .window(100000)
        .toArray()
        .map(chunk => chunk.toCSV());

    const workerPool = Pool(() => spawn<PreprocessWorker>(new Worker('./preprocess-worker.js')));
    
    await workerPool.terminate();
}

async function preprocessAttributesData(data: Buffer) {
    const COLUMNS_TO_DROP = ["BusinessYear", "SourceName", "ImportDate", "TIN", "HIOSProductId", "HPID", "IsNewPlan", "DesignType", "IsNoticeRequiredForPregnancy", "IsReferralRequiredForSpecialist", "SpecialistRequiringReferral", "IndianPlanVariationEstimatedAdvancedPaymentAmountPerEnrollee", "ChildOnlyPlanId", "EHBPercentTotalPremium", "EHBPediatricDentalApportionmentQuantity", "PlanEffectiveDate", "PlanExpirationDate", "OutOfCountryCoverage", "OutOfCountryCoverageDescription", "OutOfServiceAreaCoverage", "OutOfServiceAreaCoverageDescription", "URLForEnrollmentPayment", "PlanVariantMarketingName", "IssuerActuarialValue", "AVCalculatorOutputNumber", "FirstTierUtilization", "SecondTierUtilization", "SBCHavingaBabyDeductible", "SBCHavingaBabyCopayment", "SBCHavingaBabyCoinsurance", "SBCHavingaBabyLimit", "SBCHavingDiabetesDeductible", "SBCHavingDiabetesCopayment", "SBCHavingDiabetesCoinsurance", "SBCHavingDiabetesLimit", "SBCHavingSimplefractureDeductible", "SBCHavingSimplefractureCopayment", "SBCHavingSimplefractureCoinsurance", "SBCHavingSimplefractureLimit", "IsHSAEligible", "HSAOrHRAEmployerContribution", "HSAOrHRAEmployerContributionAmount", "URLForSummaryofBenefitsCoverage", "QHPNonQHPTypeId", "UniquePlanDesign", "CompositeRatingOffered"];

    // Array of CSV representations of 1000 rows in the dataframe.
    const dfChunkJsonStrings = dataForge.fromCSV(data.toString('utf-8'))
        .dropSeries<RawAttributeModel>(COLUMNS_TO_DROP)
        .window(2000)
        .toArray()
        .map(chunk => chunk.toCSV());

    const workerPool = Pool(() => spawn<PreprocessWorker>(new Worker('./preprocess-worker.js')));
    const resultChunks = await Promise.all(dfChunkJsonStrings.map(chunk => workerPool.queue(worker => worker.preprocessAttributesData(chunk))));

    await workerPool.terminate();
    return resultChunks.reduce((prev, curr) => ({...prev, ...curr}), {});
}

async function preprocessRateData(data: Buffer) {
    /**
     * Useless columns for our purpose. To be dropped in data processing.
     */
    const COLUMNS_TO_DROP = ["SourceName", "ImportDate", "FederalTIN", "RateEffectiveDate", "RateExpirationDate", "BusinessYear"];

    const numberTransformer = (val?: string) => val ? Number(val) : undefined;

    const TRANSFORMATION_MAP = {
        StateCode: (val: string) => val as StateCode,
        IndividualRate: (val: string) => Number(val),
        IndividualTobaccoRate: numberTransformer,
        Couple: numberTransformer, 
        PrimarySubscriberAndOneDependent: numberTransformer,
        PrimarySubscriberAndTwoDependents: numberTransformer,
        PrimarySubscriberAndThreeOrMoreDependents: numberTransformer,
        CoupleAndOneDependent: numberTransformer,
        CoupleAndTwoDependents: numberTransformer,
        CoupleAndThreeOrMoreDependents: numberTransformer,
        RatingAreaId: (value: string, index: number) => {
            const matches = ratingAreaStringRegex.exec(value);
            if (!matches || isEmpty(matches)) {
                throw `RatingAreaId on row ${index} has invalid value ${value}`;
            }

            const res = parseInt(matches[1]);
            if (!res) {
                throw `RatingAreaId on row ${index} has invalid value ${value}`;
            }

            return res;
        }
    };

    const ratingAreaStringRegex = /^Rating Area (\d{1,2})$/;

    type TransformedData = {[Property in keyof RawRateModel]: Property extends keyof typeof TRANSFORMATION_MAP ? ReturnType<typeof TRANSFORMATION_MAP[Property]> : RawRateModel[Property]};

    const result = dataForge.fromCSV(data.toString('utf-8'))
        .dropSeries<RawRateModel>(COLUMNS_TO_DROP)
        .transformSeries<TransformedData>(TRANSFORMATION_MAP)
        .aggregate<{[key: string]: RatePreprocessModel}>({}, (prev, row) => {
            if (!prev[row.PlanId]) {
                prev[row.PlanId] = {
                    stateCode: row.StateCode,
                    issuerId: row.IssuerId,
                    standardComponentId: row.PlanId,
                    rateDetail: {},
                };
            }

            const plan = prev[row.PlanId]!;
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
                            row.PrimarySubscriberAndOneDependent!,
                            row.PrimarySubscriberAndTwoDependents!,
                            row.PrimarySubscriberAndThreeOrMoreDependents!,
                        ],
                        couple: [
                            row.Couple!,
                            row.CoupleAndOneDependent!,
                            row.CoupleAndTwoDependents!,
                            row.CoupleAndThreeOrMoreDependents!,
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
                    : row.IndividualTobaccoRate!;
            }

            return prev;
        });
    return result;
}