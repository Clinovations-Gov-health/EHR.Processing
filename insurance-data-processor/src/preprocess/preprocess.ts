import dataForge = require("data-forge");
import cliProgress from 'cli-progress';
import "data-forge-fs";
import { Debugger } from "debug";
import { merge, mergeWith, zipWith } from "lodash";
import { Pool, spawn, Worker } from "threads";
import { DataSource } from "../util";
import { CostSharingPreprocessModel, RawCostSharingModel } from "./interface/cost-sharing";
import { PlanAttributePreprocessModel, RawAttributeModel } from "./interface/plan-attribute";
import { RatePreprocessModel, RawRateModel } from "./interface/rate";
import { PreprocessWorker } from "./preprocess-worker";

export async function preprocess(type: DataSource, data: Buffer, logger: Debugger) {
    switch (type) {
        case 'rate':
            return await preprocessRateData(data, logger);

        case 'attributes':
            return await preprocessAttributesData(data, logger);

        case 'costSharing':
            return await preprocessCostSharingData(data, logger);
    }
}

async function preprocessCostSharingData(data: Buffer, logger: Debugger) {
    const COLUMNS_TO_DROP = ["BusinessYear", "StateCode", "IssuerId", "SourceName", "ImportDate", "StandardComponentId", "EHBVarReason", "StateCode", "IssuerId"];

    logger("Loading data into dataframe")
    const dfChunkJsonStrings = dataForge.fromCSV(data.toString('utf-8'))
        .dropSeries<RawCostSharingModel>(COLUMNS_TO_DROP)
        .window(10000)
        .toArray()
        .map(chunk => chunk.toCSV());

    logger("Start processing chunks of data in separate threads");
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(dfChunkJsonStrings.length, 0);

    const workerPool = Pool(() => spawn<PreprocessWorker>(new Worker('./preprocess-worker.js')));
    workerPool.events().subscribe(val => {
        if (val.type === "taskCompleted") {
            progressBar.increment();
        }
    })
    const resultChunks = await Promise.all<Record<string, CostSharingPreprocessModel>>(dfChunkJsonStrings.map(chunk => workerPool.queue(worker => worker.preprocessCostSharingData(chunk))));
    
    progressBar.stop();
    await workerPool.terminate();
    logger("Combining data");
    return resultChunks.reduce((prev, curr) => merge(prev, curr), {});
}

async function preprocessAttributesData(data: Buffer, logger: Debugger) {
    const COLUMNS_TO_DROP = ["BusinessYear", "SourceName", "ImportDate", "TIN", "HIOSProductId", "HPID", "IsNewPlan", "DesignType", "IsNoticeRequiredForPregnancy", "IsReferralRequiredForSpecialist", "SpecialistRequiringReferral", "IndianPlanVariationEstimatedAdvancedPaymentAmountPerEnrollee", "ChildOnlyPlanId", "EHBPercentTotalPremium", "EHBPediatricDentalApportionmentQuantity", "PlanEffectiveDate", "PlanExpirationDate", "OutOfCountryCoverage", "OutOfCountryCoverageDescription", "OutOfServiceAreaCoverage", "OutOfServiceAreaCoverageDescription", "URLForEnrollmentPayment", "PlanVariantMarketingName", "IssuerActuarialValue", "AVCalculatorOutputNumber", "FirstTierUtilization", "SecondTierUtilization", "SBCHavingaBabyDeductible", "SBCHavingaBabyCopayment", "SBCHavingaBabyCoinsurance", "SBCHavingaBabyLimit", "SBCHavingDiabetesDeductible", "SBCHavingDiabetesCopayment", "SBCHavingDiabetesCoinsurance", "SBCHavingDiabetesLimit", "SBCHavingSimplefractureDeductible", "SBCHavingSimplefractureCopayment", "SBCHavingSimplefractureCoinsurance", "SBCHavingSimplefractureLimit", "IsHSAEligible", "HSAOrHRAEmployerContribution", "HSAOrHRAEmployerContributionAmount", "URLForSummaryofBenefitsCoverage", "QHPNonQHPTypeId", "UniquePlanDesign", "CompositeRatingOffered"];

    // Array of CSV representations of 3000 rows in the dataframe.
    const dfChunkJsonStrings = dataForge.fromCSV(data.toString('utf-8'))
        .dropSeries<RawAttributeModel>(COLUMNS_TO_DROP)
        .window(100)
        .toArray()
        .map(chunk => chunk.toCSV());

    logger("Start processing chunks of data in separate threads");
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(dfChunkJsonStrings.length, 0);

    const workerPool = Pool(() => spawn<PreprocessWorker>(new Worker('./preprocess-worker.js')));
    workerPool.events().subscribe(val => {
        if (val.type === "taskCompleted") {
            progressBar.increment();
        }
    })

    const resultChunks = await Promise.all<Record<string, PlanAttributePreprocessModel>>(dfChunkJsonStrings.map(chunk => workerPool.queue(worker => worker.preprocessAttributesData(chunk))));
    
    progressBar.stop();
    await workerPool.terminate();
    logger("Combining data");
    return resultChunks.reduce((prev, curr) => ({...prev, ...curr}), {});
}

async function preprocessRateData(data: Buffer, logger: Debugger) {
    const COLUMNS_TO_DROP = ["SourceName", "ImportDate", "FederalTIN", "RateEffectiveDate", "RateExpirationDate", "BusinessYear"];

    const dfChunkJsonStrings = dataForge.fromCSV(data.toString('utf-8'))
        .dropSeries<RawRateModel>(COLUMNS_TO_DROP)
        .window(3000)
        .toArray()
        .map(chunk => chunk.toCSV());

    logger("Start processing chunks of data in separate threads");
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(dfChunkJsonStrings.length, 0);

    const workerPool = Pool(() => spawn<PreprocessWorker>(new Worker('./preprocess-worker.js')));
    workerPool.events().subscribe(val => {
        if (val.type === "taskCompleted") {
            progressBar.increment();
        }
    })

    const resultChunks = await Promise.all<Record<string, RatePreprocessModel>>(dfChunkJsonStrings.map(chunk => workerPool.queue(worker => worker.preprocessRateData(chunk))));
    
    progressBar.stop();
    await workerPool.terminate();
    logger("Combining data");

    resultChunks.forEach(record => {
        Object.values(record).forEach(rec => {
            if (rec.standardComponentId === "82285AL0010001" && rec.rateDetail["2"].target === "individual") {
                console.log(rec.rateDetail["2"]?.rate);
                console.log(rec.rateDetail["2"]?.tobaccoRate)
            }
        })
    })

    return resultChunks.reduce((prev, curr) => mergeWith(prev, curr, (obj, src) => {
        if (Array.isArray(obj) && Array.isArray(src)) {
            return zipWith(obj, src, (first, second) => first === undefined ? second : first);
        }
    }), {});
}