import 'data-forge-fs';
import { appendFileSync } from "fs";
import { mapValues, create } from "lodash";
import numeral from 'numeral';
import { expose } from 'threads';
import { match } from "ts-pattern";
import { createSinglePropertyObject, DentalPlanMetalLevel, NormalPlanMetalLevel, PlanDemographic, PlanType, StateCode } from "../util";
import { DeductibleProperties, DentalOnlyDependentProperties, OOPProperties, PlanAttributePreprocessModel, RawAttributeModel } from "./interface/plan-attribute";
import dataForge = require('data-forge');
import { threadId } from 'worker_threads';
import nearley from 'nearley';
import { BenefitItemLimit, BenefitItemCostSharingScheme, CostSharingPreprocessModel, RawCostSharingModel, EHBInfo, CostSharingBenefit } from './interface/cost-sharing';

import costSharingLimitUnitGrammar from './grammars/cost-sharing-limit-unit-grammar';
import costSharingCostDetailGrammar from './grammars/cost-sharing-cost-detail-grammar';

export type PreprocessWorker = typeof worker;

export const worker = {
    preprocessAttributesData: (chunk: string) => {
        const percentageStringTransformer = (val?: string) => val ? numeral(val).value() : undefined;
        const dollarValueStringTransformer = (val?: string) => {
            if (!val) {
                return undefined;
            }
    
            val = val.toLowerCase();
            if (val.includes("not applicable")) {
                return undefined;
            } else {
                return numeral(val).value();
            }
        };
        const integerStringTransformer = (val: string) => val && val !== "0" ? Number(val) : undefined;
        const booleanStringTransformer = (val: string) => val === "Yes";
    
        const TRANSFORMATION_MAP = {
            MEHBDedInnTier1Coinsurance: percentageStringTransformer,
            MEHBDedInnTier2Coinsurance: percentageStringTransformer,
            DEHBDedInnTier1Coinsurance: percentageStringTransformer,
            DEHBDedInnTier2Coinsurance: percentageStringTransformer,
            TEHBDedInnTier1Coinsurance: percentageStringTransformer,
            TEHBDedInnTier2Coinsurance: percentageStringTransformer,
            IsGuaranteedRate: (val?: string) => val === "Guaranteed Rate",
            DiseaseManagementProgramsOffered: (val?: string) => val?.toLowerCase()?.split(', ') ?? [],
            MultipleInNetworkTiers: booleanStringTransformer,
            NationalNetwork: booleanStringTransformer,
            WellnessProgramOffered: (val?: string) => val === "Yes",
            MedicalDrugDeductiblesIntegrated: (val?: string) => val === "Yes",
            MedicalDrugMaximumOutofPocketIntegrated: (val?: string) => val === "Yes",
            DentalOnlyPlan: booleanStringTransformer,
            InpatientCopaymentMaximumDays: integerStringTransformer, 
            BeginPrimaryCareCostSharingAfterNumberOfVisits: integerStringTransformer, 
            BeginPrimaryCareDeductibleCoinsuranceAfterNumberOfCopays: integerStringTransformer,
            SpecialtyDrugMaximumCoinsurance: dollarValueStringTransformer,
            MEHBInnTier1IndividualMOOP: dollarValueStringTransformer,
            MEHBInnTier1FamilyPerPersonMOOP: dollarValueStringTransformer,
            MEHBInnTier1FamilyPerGroupMOOP: dollarValueStringTransformer,
            MEHBInnTier2IndividualMOOP:  dollarValueStringTransformer,
            MEHBInnTier2FamilyPerPersonMOOP: dollarValueStringTransformer,
            MEHBInnTier2FamilyPerGroupMOOP: dollarValueStringTransformer,
            MEHBOutOfNetIndividualMOOP: dollarValueStringTransformer,
            MEHBOutOfNetFamilyPerPersonMOOP: dollarValueStringTransformer,
            MEHBOutOfNetFamilyPerGroupMOOP: dollarValueStringTransformer,
            MEHBCombInnOonIndividualMOOP: dollarValueStringTransformer,
            MEHBCombInnOonFamilyPerPersonMOOP: dollarValueStringTransformer,
            MEHBCombInnOonFamilyPerGroupMOOP: dollarValueStringTransformer,
            DEHBInnTier1IndividualMOOP: dollarValueStringTransformer,
            DEHBInnTier1FamilyPerPersonMOOP: dollarValueStringTransformer,
            DEHBInnTier1FamilyPerGroupMOOP: dollarValueStringTransformer,
            DEHBInnTier2IndividualMOOP: dollarValueStringTransformer,
            DEHBInnTier2FamilyPerPersonMOOP: dollarValueStringTransformer,
            DEHBInnTier2FamilyPerGroupMOOP: dollarValueStringTransformer,
            DEHBOutOfNetIndividualMOOP: dollarValueStringTransformer,
            DEHBOutOfNetFamilyPerPersonMOOP: dollarValueStringTransformer,
            DEHBOutOfNetFamilyPerGroupMOOP: dollarValueStringTransformer,
            DEHBCombInnOonIndividualMOOP: dollarValueStringTransformer,
            DEHBCombInnOonFamilyPerPersonMOOP: dollarValueStringTransformer,
            DEHBCombInnOonFamilyPerGroupMOOP: dollarValueStringTransformer,
            TEHBInnTier1IndividualMOOP: dollarValueStringTransformer,
            TEHBInnTier1FamilyPerPersonMOOP: dollarValueStringTransformer,
            TEHBInnTier1FamilyPerGroupMOOP: dollarValueStringTransformer,
            TEHBInnTier2IndividualMOOP: dollarValueStringTransformer,
            TEHBInnTier2FamilyPerPersonMOOP: dollarValueStringTransformer,
            TEHBInnTier2FamilyPerGroupMOOP: dollarValueStringTransformer,
            TEHBOutOfNetIndividualMOOP: dollarValueStringTransformer,
            TEHBOutOfNetFamilyPerPersonMOOP: dollarValueStringTransformer,
            TEHBOutOfNetFamilyPerGroupMOOP: dollarValueStringTransformer,
            TEHBCombInnOonIndividualMOOP: dollarValueStringTransformer,
            TEHBCombInnOonFamilyPerPersonMOOP: dollarValueStringTransformer,
            TEHBCombInnOonFamilyPerGroupMOOP: dollarValueStringTransformer,
            MEHBDedInnTier1Individual: dollarValueStringTransformer,
            MEHBDedInnTier1FamilyPerPerson: dollarValueStringTransformer,
            MEHBDedInnTier1FamilyPerGroup: dollarValueStringTransformer,
            MEHBDedInnTier2Individual: dollarValueStringTransformer,
            MEHBDedInnTier2FamilyPerPerson: dollarValueStringTransformer,
            MEHBDedInnTier2FamilyPerGroup: dollarValueStringTransformer,
            MEHBDedOutOfNetIndividual: dollarValueStringTransformer,
            MEHBDedOutOfNetFamilyPerPerson: dollarValueStringTransformer,
            MEHBDedOutOfNetFamilyPerGroup: dollarValueStringTransformer,
            MEHBDedCombInnOonIndividual: dollarValueStringTransformer,
            MEHBDedCombInnOonFamilyPerPerson: dollarValueStringTransformer,
            MEHBDedCombInnOonFamilyPerGroup: dollarValueStringTransformer,
            DEHBDedInnTier1Individual: dollarValueStringTransformer,
            DEHBDedInnTier1FamilyPerPerson: dollarValueStringTransformer,
            DEHBDedInnTier1FamilyPerGroup: dollarValueStringTransformer,
            DEHBDedInnTier2Individual: dollarValueStringTransformer,
            DEHBDedInnTier2FamilyPerPerson: dollarValueStringTransformer,
            DEHBDedInnTier2FamilyPerGroup: dollarValueStringTransformer,
            DEHBDedOutOfNetIndividual: dollarValueStringTransformer,
            DEHBDedOutOfNetFamilyPerPerson: dollarValueStringTransformer,
            DEHBDedOutOfNetFamilyPerGroup: dollarValueStringTransformer,
            DEHBDedCombInnOonIndividual: dollarValueStringTransformer,
            DEHBDedCombInnOonFamilyPerPerson: dollarValueStringTransformer,
            DEHBDedCombInnOonFamilyPerGroup: dollarValueStringTransformer,
            TEHBDedInnTier1Individual: dollarValueStringTransformer,
            TEHBDedInnTier1FamilyPerPerson: dollarValueStringTransformer,
            TEHBDedInnTier1FamilyPerGroup: dollarValueStringTransformer,
            TEHBDedInnTier2Individual: dollarValueStringTransformer,
            TEHBDedInnTier2FamilyPerPerson: dollarValueStringTransformer,
            TEHBDedInnTier2FamilyPerGroup: dollarValueStringTransformer,
            TEHBDedOutOfNetIndividual: dollarValueStringTransformer,
            TEHBDedOutOfNetFamilyPerPerson: dollarValueStringTransformer,
            TEHBDedOutOfNetFamilyPerGroup: dollarValueStringTransformer,
            TEHBDedCombInnOonIndividual: dollarValueStringTransformer,
            TEHBDedCombInnOonFamilyPerPerson: dollarValueStringTransformer,
            TEHBDedCombInnOonFamilyPerGroup: dollarValueStringTransformer,
            StateCode: (val: string) => val as StateCode,
            PlanType: (val: string) => val as PlanType,
            ChildOnlyOffering: (val: string): PlanDemographic => {
                switch (val) {
                    case 'Allows Adult and Child-Only': return 'both';
                    case 'Allows Adult-Only': return 'adult';
                    case 'Allows Child-Only': return 'child';
                    default: throw "Invalid code path.";
                }
            },
            MetalLevel: (val: string) => val.toLowerCase() as DentalPlanMetalLevel | NormalPlanMetalLevel,
        } as const;
    
        type TransformedData = {[Property in keyof typeof TRANSFORMATION_MAP]: ReturnType<typeof TRANSFORMATION_MAP[Property]>}
            & {[Property in keyof Omit<RawAttributeModel, keyof typeof TRANSFORMATION_MAP>]: RawAttributeModel[Property]};      

        const result = dataForge.fromCSV(chunk)
            .transformSeries<TransformedData>(mapValues(TRANSFORMATION_MAP, (fn, property) => (val: any, idx: number) => {
                if (idx !== 0 && idx % 1000 === 0) {
                    appendFileSync('log', `worker ${threadId}: ${property}: row ${idx}\n`);
                }

                return fn(val);
            }))
            .aggregate<{[key: string]: PlanAttributePreprocessModel}>({}, (prev, row) => {
                const dentalOnlyDependentProperties: DentalOnlyDependentProperties = row.DentalOnlyPlan
                    ? {
                        isDentalOnly: true,
                        metalLevel: row.MetalLevel as DentalPlanMetalLevel,
                        oop: {
                            inNetwork: {
                                ...createSinglePropertyObject("individual", row.MEHBInnTier1IndividualMOOP),
                                ...createSinglePropertyObject("familyPerPerson", row.MEHBCombInnOonFamilyPerPersonMOOP),
                                ...createSinglePropertyObject("familyPerGroup", row.MEHBCombInnOonFamilyPerGroupMOOP),
                            },
                            outNetwork: {
                                ...createSinglePropertyObject("individual", row.MEHBOutOfNetIndividualMOOP),
                                ...createSinglePropertyObject("familyPerPerson", row.MEHBOutOfNetFamilyPerPersonMOOP),
                                ...createSinglePropertyObject("familyPerGroup", row.MEHBOutOfNetFamilyPerGroupMOOP),
                            },
                            combined: {
                                ...createSinglePropertyObject("individual", row.MEHBCombInnOonIndividualMOOP),
                                ...createSinglePropertyObject("familyPerPerson", row.MEHBCombInnOonFamilyPerPersonMOOP),
                                ...createSinglePropertyObject("familyPerGroup", row.MEHBCombInnOonFamilyPerGroupMOOP),
                            },
                        },
                        deductible: {
                            inNetwork: {
                                ...createSinglePropertyObject("individual", row.MEHBDedInnTier1Individual),
                                ...createSinglePropertyObject("familyPerPerson", row.MEHBDedCombInnOonFamilyPerPerson),
                                ...createSinglePropertyObject("familyPerGroup", row.MEHBDedCombInnOonFamilyPerGroup),
                                ...createSinglePropertyObject("coinsurance", row.MEHBDedInnTier1Coinsurance),
                            },
                            outNetwork: {
                                ...createSinglePropertyObject("individual", row.MEHBDedOutOfNetIndividual),
                                ...createSinglePropertyObject("familyPerPerson", row.MEHBDedOutOfNetFamilyPerPerson),
                                ...createSinglePropertyObject("familyPerGroup", row.MEHBDedOutOfNetFamilyPerGroup),
                            },
                            combined: {
                                ...createSinglePropertyObject("individual", row.MEHBDedCombInnOonIndividual),
                                ...createSinglePropertyObject("familyPerPerson", row.MEHBDedCombInnOonFamilyPerPerson),
                                ...createSinglePropertyObject("familyPerGroup", row.MEHBDedCombInnOonFamilyPerGroup),
                            },
                        }
                    } : {
                        isDentalOnly: false,
                        formularyId: row.FormularyId!,
                        metalLevel: row.MetalLevel as NormalPlanMetalLevel,
                        dmp: {
                            wellness: row.WellnessProgramOffered,
                            asthma: row.DiseaseManagementProgramsOffered.includes("asthma"),
                            heartDisease: row.DiseaseManagementProgramsOffered.includes("heart disease"),
                            depression: row.DiseaseManagementProgramsOffered.includes("depression"),
                            diabetes: row.DiseaseManagementProgramsOffered.includes("diabetes"),
                            highBloodPressureAndHighCholesterol: row.DiseaseManagementProgramsOffered.includes("high blood pressure & high cholesterol"),
                            lowBackPain: row.DiseaseManagementProgramsOffered.includes("low back pain"),
                            painManagement: row.DiseaseManagementProgramsOffered.includes("pain management"),
                            pregnancy: row.DiseaseManagementProgramsOffered.includes("pregnancy"),
                            weightLoss: row.DiseaseManagementProgramsOffered.includes("weight loss programs"),
                        },
                        formularyUrl: row.FormularyURL!,
                        ...createSinglePropertyObject("specialtyDrugMaximumCoinsurance", row.SpecialtyDrugMaximumCoinsurance),
                        ...{
                            ...getOOPProperties(row),
                            ...getDeductibleProperties(row),
                        } as OOPProperties & DeductibleProperties,
                    };           
    
                prev[row.PlanId] = {
                    stateCode: row.StateCode,
                    issuerId: row.IssuerId,
                    isIndividual: row.MarketCoverage === "Individual",
                    standardComponentId: row.StandardComponentId,
                    marketingName: row.PlanMarketingName,
                    planType: row.PlanType,
                    ...createSinglePropertyObject("planLevelExclusions", row.PlanLevelExclusions),
                    demographics: row.ChildOnlyOffering,
                    isGuaranteed: row.IsGuaranteedRate,
                    nationalNetwork: row.NationalNetwork,
                    variantId: row.PlanId.split('-')[1],
                    variationType: row.CSRVariationType,
                    ...createSinglePropertyObject("beginPrimaryCareCostSharingAfterNumberOfVisits", row.BeginPrimaryCareCostSharingAfterNumberOfVisits),
                    ...createSinglePropertyObject("inpatientCopaymentMaximumDays", row.InpatientCopaymentMaximumDays),
                    ...createSinglePropertyObject("beginPrimaryCareDeductibleCoinsuranceAfterNumberOfCopays", row.BeginPrimaryCareDeductibleCoinsuranceAfterNumberOfCopays),
                    ...createSinglePropertyObject("brochureUrl", row.PlanBrochure),
                    ...dentalOnlyDependentProperties,
                };
    
                return prev;
            });

        return result;

        function getDeductibleProperties(row: TransformedData): DeductibleProperties {
            return match<[boolean, boolean], DeductibleProperties>([row.MultipleInNetworkTiers, row.MedicalDrugDeductiblesIntegrated])
                .with([false, true], () => ({
                    isMultiTiered: false,
                    medicalDrugDeductibleIntegrated: true,
                    deductible: {
                        inNetwork: { individual: row.TEHBDedInnTier1Individual, familyPerPerson: row.TEHBDedInnTier1FamilyPerPerson, familyPerGroup: row.TEHBDedInnTier1FamilyPerGroup, coinsurance: row.TEHBDedInnTier1Coinsurance },
                        outNetwork: { individual: row.TEHBDedOutOfNetIndividual, familyPerPerson: row.TEHBDedOutOfNetFamilyPerPerson, familyPerGroup: row.TEHBDedOutOfNetFamilyPerGroup },
                        combined: { individual: row.TEHBDedCombInnOonIndividual, familyPerPerson: row.TEHBDedCombInnOonFamilyPerPerson, familyPerGroup: row.TEHBDedCombInnOonFamilyPerGroup },
                    },
                }))
                .with([false, false], () => ({
                    isMultiTiered: false,
                    medicalDrugDeductibleIntegrated: false,
                    deductible: {
                        medicalInNetwork: { individual: row.MEHBDedInnTier1Individual, familyPerPerson: row.MEHBDedInnTier1FamilyPerPerson, familyPerGroup: row.MEHBDedInnTier1FamilyPerGroup, coinsurance: row.MEHBDedInnTier1Coinsurance },
                        medicalOutNetwork: { individual: row.MEHBDedOutOfNetIndividual, familyPerPerson: row.MEHBDedOutOfNetFamilyPerPerson, familyPerGroup: row.MEHBDedOutOfNetFamilyPerGroup },
                        medicalCombined: { individual: row.MEHBDedCombInnOonIndividual, familyPerPerson: row.MEHBDedCombInnOonFamilyPerPerson, familyPerGroup: row.MEHBDedCombInnOonFamilyPerGroup },
                        drugInNetwork: { individual: row.DEHBDedInnTier1Individual, familyPerPerson: row.DEHBDedInnTier1FamilyPerPerson, familyPerGroup: row.DEHBDedInnTier1FamilyPerGroup, coinsurance: row.DEHBDedInnTier1Coinsurance },
                        drugOutNetwork: { individual: row.DEHBDedOutOfNetIndividual, familyPerPerson: row.DEHBDedOutOfNetFamilyPerPerson, familyPerGroup: row.DEHBDedOutOfNetFamilyPerGroup },
                        drugCombined: { individual: row.DEHBDedCombInnOonIndividual, familyPerPerson: row.DEHBDedCombInnOonFamilyPerPerson, familyPerGroup: row.DEHBDedCombInnOonFamilyPerGroup },
                    },
                }))
                .with([true, true], () => ({
                    isMultiTiered: true,
                    medicalDrugDeductibleIntegrated: true,
                    deductible: {
                        tierOneInNetwork: { individual: row.TEHBDedInnTier1Individual, familyPerPerson: row.TEHBDedInnTier1FamilyPerPerson, familyPerGroup: row.TEHBDedInnTier1FamilyPerGroup, coinsurance: row.TEHBDedInnTier1Coinsurance },
                        tierTwoInNetwork: { individual: row.TEHBDedInnTier2Individual, familyPerPerson: row.TEHBDedInnTier2FamilyPerPerson, familyPerGroup: row.TEHBDedInnTier2FamilyPerGroup, coinsurance: row.TEHBDedInnTier2Coinsurance },
                        outNetwork: { individual: row.TEHBDedOutOfNetIndividual, familyPerPerson: row.TEHBDedOutOfNetFamilyPerPerson, familyPerGroup: row.TEHBDedOutOfNetFamilyPerGroup },
                        combined: { individual: row.TEHBDedCombInnOonIndividual, familyPerPerson: row.TEHBDedCombInnOonFamilyPerPerson, familyPerGroup: row.TEHBCombInnOonFamilyPerGroupMOOP },
                    },
                }))
                .with([true, false], () => ({
                    isMultiTiered: true,
                    medicalDrugDeductibleIntegrated: false,
                    deductible: {
                        medicalTierOneInNetwork: { individual: row.MEHBDedInnTier1Individual, familyPerPerson: row.MEHBDedInnTier1FamilyPerPerson, familyPerGroup: row.MEHBDedInnTier1FamilyPerGroup, coinsurance: row.MEHBDedInnTier1Coinsurance },
                        medicalTierTwoInNetwork: { individual: row.MEHBDedInnTier2Individual, familyPerPerson: row.MEHBDedInnTier2FamilyPerPerson, familyPerGroup: row.MEHBDedInnTier2FamilyPerGroup, coinsurance: row.MEHBDedInnTier2Coinsurance },
                        medicalOutNetwork: { individual: row.MEHBDedOutOfNetIndividual, familyPerPerson: row.MEHBDedOutOfNetFamilyPerPerson, familyPerGroup: row.MEHBDedOutOfNetFamilyPerGroup },
                        medicalCombined: { individual: row.MEHBDedCombInnOonIndividual, familyPerPerson: row.MEHBDedCombInnOonFamilyPerPerson, familyPerGroup: row.MEHBDedCombInnOonFamilyPerGroup }, 
                        drugTierOneInNetwork: { individual: row.DEHBDedInnTier1Individual, familyPerPerson: row.DEHBDedInnTier1FamilyPerPerson, familyPerGroup: row.DEHBDedInnTier1FamilyPerGroup, coinsurance: row.DEHBDedInnTier1Coinsurance },
                        drugTierTwoInNetwork: { individual: row.DEHBDedInnTier2Individual, familyPerPerson: row.DEHBDedInnTier2FamilyPerPerson, familyPerGroup: row.DEHBDedInnTier2FamilyPerGroup, coinsurance: row.DEHBDedInnTier2Coinsurance },
                        drugOutNetwork: { individual: row.DEHBDedOutOfNetIndividual, familyPerPerson: row.DEHBDedOutOfNetFamilyPerPerson, familyPerGroup: row.DEHBDedOutOfNetFamilyPerGroup },
                        drugCombined: { individual: row.DEHBDedCombInnOonIndividual, familyPerPerson: row.DEHBDedCombInnOonFamilyPerPerson, familyPerGroup: row.DEHBDedCombInnOonFamilyPerGroup },   
                    }
                }))
                .run();
        }

        function getOOPProperties(row: TransformedData): OOPProperties {
            return match<[boolean, boolean], OOPProperties>([row.MultipleInNetworkTiers, row.MedicalDrugMaximumOutofPocketIntegrated])
                .with([false, true], () => ({
                    isMultiTiered: false,
                    medicalDrugOOPIntegrated: true,
                    oop: {
                        inNetwork: { individual: row.TEHBInnTier1IndividualMOOP, familyPerPerson: row.TEHBInnTier1FamilyPerPersonMOOP, familyPerGroup: row.TEHBInnTier1FamilyPerGroupMOOP },
                        outNetwork: { individual: row.TEHBOutOfNetIndividualMOOP, familyPerPerson: row.TEHBOutOfNetFamilyPerPersonMOOP, familyPerGroup: row.TEHBOutOfNetFamilyPerGroupMOOP },
                        combined: { individual: row.TEHBCombInnOonIndividualMOOP, familyPerPerson: row.TEHBCombInnOonFamilyPerPersonMOOP, familyPerGroup: row.TEHBCombInnOonFamilyPerGroupMOOP },
                    },
                }))
                .with([false, false], () => ({
                    isMultiTiered: false,
                    medicalDrugOOPIntegrated: false,
                    oop: {
                        medicalInNetwork: { individual: row.MEHBInnTier1IndividualMOOP, familyPerPerson: row.MEHBInnTier1FamilyPerPersonMOOP, familyPerGroup: row.MEHBInnTier1FamilyPerGroupMOOP },
                        medicalOutNetwork: { individual: row.MEHBOutOfNetIndividualMOOP, familyPerPerson: row.MEHBOutOfNetFamilyPerPersonMOOP, familyPerGroup: row.MEHBOutOfNetFamilyPerGroupMOOP },
                        medicalCombined: { individual: row.MEHBCombInnOonIndividualMOOP, familyPerPerson: row.MEHBCombInnOonFamilyPerPersonMOOP, familyPerGroup: row.MEHBCombInnOonFamilyPerGroupMOOP },
                        drugInNetwork: { individual: row.DEHBInnTier1IndividualMOOP, familyPerPerson: row.DEHBInnTier1FamilyPerPersonMOOP, familyPerGroup: row.DEHBInnTier1FamilyPerGroupMOOP },
                        drugOutNetwork: { individual: row.DEHBOutOfNetIndividualMOOP, familyPerPerson: row.DEHBOutOfNetFamilyPerPersonMOOP, familyPerGroup: row.DEHBOutOfNetFamilyPerGroupMOOP },
                        drugCombined: { individual: row.DEHBCombInnOonIndividualMOOP, familyPerPerson: row.DEHBCombInnOonFamilyPerPersonMOOP, familyPerGroup: row.DEHBCombInnOonFamilyPerGroupMOOP },
                    },
                }))
                .with([true, true], () => ({
                    isMultiTiered: true,
                    medicalDrugOOPIntegrated: true,
                    oop: {
                        tierOneInNetwork: { individual: row.TEHBInnTier1IndividualMOOP, familyPerPerson: row.TEHBInnTier1FamilyPerPersonMOOP, familyPerGroup: row.TEHBInnTier1FamilyPerGroupMOOP },
                        tierTwoInNetwork: { individual: row.TEHBInnTier2IndividualMOOP, familyPerPerson: row.TEHBInnTier2FamilyPerPersonMOOP, familyPerGroup: row.TEHBInnTier2FamilyPerGroupMOOP },
                        outNetwork: { individual: row.TEHBOutOfNetIndividualMOOP, familyPerPerson: row.TEHBOutOfNetFamilyPerPersonMOOP, familyPerGroup: row.TEHBOutOfNetFamilyPerGroupMOOP },
                        combined: { individual: row.TEHBCombInnOonIndividualMOOP, familyPerPerson: row.TEHBCombInnOonFamilyPerPersonMOOP, familyPerGroup: row.TEHBCombInnOonFamilyPerGroupMOOP },
                    },
                }))
                .with([true, false], () => ({
                    isMultiTiered: true,
                    medicalDrugOOPIntegrated: false,
                    oop: {
                        medicalTierOneInNetwork: { individual: row.MEHBInnTier1IndividualMOOP, familyPerPerson: row.MEHBInnTier1FamilyPerPersonMOOP, familyPerGroup: row.MEHBInnTier1FamilyPerGroupMOOP },
                        medicalTierTwoInNetwork: { individual: row.MEHBInnTier2IndividualMOOP, familyPerPerson: row.MEHBInnTier2FamilyPerPersonMOOP, familyPerGroup: row.MEHBInnTier2FamilyPerGroupMOOP },
                        medicalOutNetwork: { individual: row.MEHBOutOfNetIndividualMOOP, familyPerPerson: row.MEHBOutOfNetFamilyPerPersonMOOP, familyPerGroup: row.MEHBOutOfNetFamilyPerGroupMOOP },
                        medicalCombined: { individual: row.MEHBCombInnOonIndividualMOOP, familyPerPerson: row.MEHBCombInnOonFamilyPerPersonMOOP, familyPerGroup: row.MEHBCombInnOonFamilyPerGroupMOOP }, 
                        drugTierOneInNetwork: { individual: row.DEHBInnTier1IndividualMOOP, familyPerPerson: row.DEHBInnTier1FamilyPerPersonMOOP, familyPerGroup: row.DEHBInnTier1FamilyPerGroupMOOP },
                        drugTierTwoInNetwork: { individual: row.DEHBInnTier2IndividualMOOP, familyPerPerson: row.DEHBInnTier2FamilyPerPersonMOOP, familyPerGroup: row.DEHBInnTier2FamilyPerGroupMOOP },
                        drugOutNetwork: { individual: row.DEHBOutOfNetIndividualMOOP, familyPerPerson: row.DEHBOutOfNetFamilyPerPersonMOOP, familyPerGroup: row.DEHBOutOfNetFamilyPerGroupMOOP },
                        drugCombined: { individual: row.DEHBCombInnOonIndividualMOOP, familyPerPerson: row.DEHBCombInnOonFamilyPerPersonMOOP, familyPerGroup: row.DEHBCombInnOonFamilyPerGroupMOOP },   
                    }
                }))
                .run();
        }
    },
    preprocessCostSharingData: (chunk: string) => {
        const parseLimitUnit = (val?: string) => {
            if (!val) return undefined;
            const parser = new nearley.Parser(nearley.Grammar.fromCompiled(costSharingLimitUnitGrammar));
            return parser.feed(val).finish()[0] as Omit<BenefitItemLimit, "quantity">;
        }

        const parseCostDetail = (val?: string) => {
            if (!val) return undefined;
            const parser = new nearley.Parser(nearley.Grammar.fromCompiled(costSharingCostDetailGrammar));
            return parser.feed(val).finish()[0] as BenefitItemCostSharingScheme;
        }

        const TRANSFORMATION_MAP = {
            PlanId: (val: string): [string, string] => {
                const components = val.split('-');
                return [components[0], components[1]];
            },
            BenefitName: (val: string) => val.trim().replaceAll(/[\t""]/, ""),
            CopayInnTier1: parseCostDetail,
            CopayInnTier2: parseCostDetail,
            CopayOutofNet: parseCostDetail,
            CoinsInnTier1: parseCostDetail,
            CoinsInnTier2: parseCostDetail,
            CoinsOutofNet: parseCostDetail,
            IsEHB: (val?: string) => val === "Yes",
            IsCovered: (val?: string) => val === "Covered",
            QuantLimitOnSvc: (val?: string) => val === "Yes",
            LimitQty: (val?: string) => val ? numeral(val).value() : undefined,
            LimitUnit: parseLimitUnit, // TODO
            Exclusions: (val?: string) => val ?? undefined,
            Explanation: (val?: string) => val ?? undefined,
            IsExclFromInnMOOP: (val?: string) => val === "Yes",
            IsExclFromOonMOOP: (val?: string) => val === "Yes",
        } as const;

        type TransformedData = {[Property in keyof RawCostSharingModel]-?: Property extends keyof typeof TRANSFORMATION_MAP
            ? ReturnType<typeof TRANSFORMATION_MAP[Property]>
            : RawCostSharingModel[Property]};

        const result = dataForge.fromCSV(chunk)
            .transformSeries<TransformedData>(TRANSFORMATION_MAP)
            .aggregate<{[key: string]: CostSharingPreprocessModel}>({}, (prev, row) => {
                const key = row.PlanId.join('-');
                if (!prev[key]) {
                    prev[key] = {
                        standardComponentId: row.PlanId[0],
                        variantId: row.PlanId[1],
                        benefits: {},
                    };
                }

                const ehbInfo: EHBInfo = row.IsEHB
                    ? { isEHB: true, isExcludedFromInNetworkMOOP: row.IsExclFromInnMOOP, isExcludedFromOutOfNetworkMOOP: row.IsExclFromOonMOOP }
                    : { isEHB: false };

                const limit: BenefitItemLimit | undefined = row.LimitUnit
                    ? { quantity: row.LimitQty, ...row.LimitUnit }
                    : undefined;

                const result: CostSharingBenefit = row.IsCovered
                    ? { covered: false }
                    : {
                        covered: true,
                        ...createSinglePropertyObject("exclusions", row.Exclusions),
                        ...createSinglePropertyObject("explanations", row.Explanation),
                        ...createSinglePropertyObject("limit", limit),
                        
                    }
            });
    }
}

expose(worker);