import 'data-forge-fs';
import { compact, isEmpty } from "lodash";
import nearley from 'nearley';
import numeral from 'numeral';
import { expose } from 'threads';
import { match } from "ts-pattern";
import { createSinglePropertyObject, DentalPlanMetalLevel, NormalPlanMetalLevel, PlanDemographic, PlanType, StateCode } from "../util";
import costSharingCostDetailGrammar from './grammars/cost-sharing-cost-detail-grammar';
import costSharingLimitUnitGrammar from './grammars/cost-sharing-limit-unit-grammar';
import { BenefitItemCostSharingScheme, BenefitItemLimit, CostSharingBenefit, CostSharingPreprocessModel, EHBInfo, RawCostSharingModel } from './interface/cost-sharing';
import { DentalOnlyDependentProperties, PlanAttributePreprocessModel, RawAttributeModel, SingleTieredMaximumDeducitbleProperties, MultiTieredMaximumDeductibleProperties, SingleTieredOOPProperties, MultiTieredOOPProperties, CostCeilingProperties } from "./interface/plan-attribute";
import { RatePreprocessModel, RawRateModel } from './interface/rate';
import dataForge = require('data-forge');
import pluralize from 'pluralize';


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
            .transformSeries<TransformedData>(TRANSFORMATION_MAP)
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
                        costCeiling: {
                            isMultiTiered: row.MultipleInNetworkTiers,
                            deductible: getDeductibleProperties(row),
                            oop: getOOPProperties(row),
                        } as CostCeilingProperties,
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

        function getDeductibleProperties(row: TransformedData): SingleTieredMaximumDeducitbleProperties | MultiTieredMaximumDeductibleProperties {
            return match<[boolean, boolean], SingleTieredMaximumDeducitbleProperties | MultiTieredMaximumDeductibleProperties>([row.MultipleInNetworkTiers, row.MedicalDrugDeductiblesIntegrated])
                .with([false, true], () => ({
                    medicalDrugIntegrated: true,
                    inNetwork: { individual: row.TEHBDedInnTier1Individual, familyPerPerson: row.TEHBDedInnTier1FamilyPerPerson, familyPerGroup: row.TEHBDedInnTier1FamilyPerGroup, coinsurance: row.TEHBDedInnTier1Coinsurance },
                    outNetwork: { individual: row.TEHBDedOutOfNetIndividual, familyPerPerson: row.TEHBDedOutOfNetFamilyPerPerson, familyPerGroup: row.TEHBDedOutOfNetFamilyPerGroup },
                    combined: { individual: row.TEHBDedCombInnOonIndividual, familyPerPerson: row.TEHBDedCombInnOonFamilyPerPerson, familyPerGroup: row.TEHBDedCombInnOonFamilyPerGroup },
                }))
                .with([false, false], () => ({
                    medicalDrugIntegrated: false,
                    medicalInNetwork: { individual: row.MEHBDedInnTier1Individual, familyPerPerson: row.MEHBDedInnTier1FamilyPerPerson, familyPerGroup: row.MEHBDedInnTier1FamilyPerGroup, coinsurance: row.MEHBDedInnTier1Coinsurance },
                    medicalOutNetwork: { individual: row.MEHBDedOutOfNetIndividual, familyPerPerson: row.MEHBDedOutOfNetFamilyPerPerson, familyPerGroup: row.MEHBDedOutOfNetFamilyPerGroup },
                    medicalCombined: { individual: row.MEHBDedCombInnOonIndividual, familyPerPerson: row.MEHBDedCombInnOonFamilyPerPerson, familyPerGroup: row.MEHBDedCombInnOonFamilyPerGroup },
                    drugInNetwork: { individual: row.DEHBDedInnTier1Individual, familyPerPerson: row.DEHBDedInnTier1FamilyPerPerson, familyPerGroup: row.DEHBDedInnTier1FamilyPerGroup, coinsurance: row.DEHBDedInnTier1Coinsurance },
                    drugOutNetwork: { individual: row.DEHBDedOutOfNetIndividual, familyPerPerson: row.DEHBDedOutOfNetFamilyPerPerson, familyPerGroup: row.DEHBDedOutOfNetFamilyPerGroup },
                    drugCombined: { individual: row.DEHBDedCombInnOonIndividual, familyPerPerson: row.DEHBDedCombInnOonFamilyPerPerson, familyPerGroup: row.DEHBDedCombInnOonFamilyPerGroup },
                }))
                .with([true, true], () => ({
                    medicalDrugIntegrated: true,
                    tierOneInNetwork: { individual: row.TEHBDedInnTier1Individual, familyPerPerson: row.TEHBDedInnTier1FamilyPerPerson, familyPerGroup: row.TEHBDedInnTier1FamilyPerGroup, coinsurance: row.TEHBDedInnTier1Coinsurance },
                    tierTwoInNetwork: { individual: row.TEHBDedInnTier2Individual, familyPerPerson: row.TEHBDedInnTier2FamilyPerPerson, familyPerGroup: row.TEHBDedInnTier2FamilyPerGroup, coinsurance: row.TEHBDedInnTier2Coinsurance },
                    outNetwork: { individual: row.TEHBDedOutOfNetIndividual, familyPerPerson: row.TEHBDedOutOfNetFamilyPerPerson, familyPerGroup: row.TEHBDedOutOfNetFamilyPerGroup },
                    combined: { individual: row.TEHBDedCombInnOonIndividual, familyPerPerson: row.TEHBDedCombInnOonFamilyPerPerson, familyPerGroup: row.TEHBCombInnOonFamilyPerGroupMOOP },
                }))
                .with([true, false], () => ({
                    medicalDrugIntegrated: false,
                    medicalTierOneInNetwork: { individual: row.MEHBDedInnTier1Individual, familyPerPerson: row.MEHBDedInnTier1FamilyPerPerson, familyPerGroup: row.MEHBDedInnTier1FamilyPerGroup, coinsurance: row.MEHBDedInnTier1Coinsurance },
                    medicalTierTwoInNetwork: { individual: row.MEHBDedInnTier2Individual, familyPerPerson: row.MEHBDedInnTier2FamilyPerPerson, familyPerGroup: row.MEHBDedInnTier2FamilyPerGroup, coinsurance: row.MEHBDedInnTier2Coinsurance },
                    medicalOutNetwork: { individual: row.MEHBDedOutOfNetIndividual, familyPerPerson: row.MEHBDedOutOfNetFamilyPerPerson, familyPerGroup: row.MEHBDedOutOfNetFamilyPerGroup },
                    medicalCombined: { individual: row.MEHBDedCombInnOonIndividual, familyPerPerson: row.MEHBDedCombInnOonFamilyPerPerson, familyPerGroup: row.MEHBDedCombInnOonFamilyPerGroup }, 
                    drugTierOneInNetwork: { individual: row.DEHBDedInnTier1Individual, familyPerPerson: row.DEHBDedInnTier1FamilyPerPerson, familyPerGroup: row.DEHBDedInnTier1FamilyPerGroup, coinsurance: row.DEHBDedInnTier1Coinsurance },
                    drugTierTwoInNetwork: { individual: row.DEHBDedInnTier2Individual, familyPerPerson: row.DEHBDedInnTier2FamilyPerPerson, familyPerGroup: row.DEHBDedInnTier2FamilyPerGroup, coinsurance: row.DEHBDedInnTier2Coinsurance },
                    drugOutNetwork: { individual: row.DEHBDedOutOfNetIndividual, familyPerPerson: row.DEHBDedOutOfNetFamilyPerPerson, familyPerGroup: row.DEHBDedOutOfNetFamilyPerGroup },
                    drugCombined: { individual: row.DEHBDedCombInnOonIndividual, familyPerPerson: row.DEHBDedCombInnOonFamilyPerPerson, familyPerGroup: row.DEHBDedCombInnOonFamilyPerGroup },   
                }))
                .run();
        }

        function getOOPProperties(row: TransformedData): SingleTieredOOPProperties | MultiTieredOOPProperties {
            return match<[boolean, boolean], SingleTieredOOPProperties | MultiTieredOOPProperties>([row.MultipleInNetworkTiers, row.MedicalDrugMaximumOutofPocketIntegrated])
                .with([false, true], () => ({
                    medicalDrugIntegrated: true,
                    inNetwork: { individual: row.TEHBInnTier1IndividualMOOP, familyPerPerson: row.TEHBInnTier1FamilyPerPersonMOOP, familyPerGroup: row.TEHBInnTier1FamilyPerGroupMOOP },
                    outNetwork: { individual: row.TEHBOutOfNetIndividualMOOP, familyPerPerson: row.TEHBOutOfNetFamilyPerPersonMOOP, familyPerGroup: row.TEHBOutOfNetFamilyPerGroupMOOP },
                    combined: { individual: row.TEHBCombInnOonIndividualMOOP, familyPerPerson: row.TEHBCombInnOonFamilyPerPersonMOOP, familyPerGroup: row.TEHBCombInnOonFamilyPerGroupMOOP },
                }))
                .with([false, false], () => ({
                    medicalDrugIntegrated: false,
                    medicalInNetwork: { individual: row.MEHBInnTier1IndividualMOOP, familyPerPerson: row.MEHBInnTier1FamilyPerPersonMOOP, familyPerGroup: row.MEHBInnTier1FamilyPerGroupMOOP },
                    medicalOutNetwork: { individual: row.MEHBOutOfNetIndividualMOOP, familyPerPerson: row.MEHBOutOfNetFamilyPerPersonMOOP, familyPerGroup: row.MEHBOutOfNetFamilyPerGroupMOOP },
                    medicalCombined: { individual: row.MEHBCombInnOonIndividualMOOP, familyPerPerson: row.MEHBCombInnOonFamilyPerPersonMOOP, familyPerGroup: row.MEHBCombInnOonFamilyPerGroupMOOP },
                    drugInNetwork: { individual: row.DEHBInnTier1IndividualMOOP, familyPerPerson: row.DEHBInnTier1FamilyPerPersonMOOP, familyPerGroup: row.DEHBInnTier1FamilyPerGroupMOOP },
                    drugOutNetwork: { individual: row.DEHBOutOfNetIndividualMOOP, familyPerPerson: row.DEHBOutOfNetFamilyPerPersonMOOP, familyPerGroup: row.DEHBOutOfNetFamilyPerGroupMOOP },
                    drugCombined: { individual: row.DEHBCombInnOonIndividualMOOP, familyPerPerson: row.DEHBCombInnOonFamilyPerPersonMOOP, familyPerGroup: row.DEHBCombInnOonFamilyPerGroupMOOP },
                }))
                .with([true, true], () => ({
                    medicalDrugIntegrated: true,
                    tierOneInNetwork: { individual: row.TEHBInnTier1IndividualMOOP, familyPerPerson: row.TEHBInnTier1FamilyPerPersonMOOP, familyPerGroup: row.TEHBInnTier1FamilyPerGroupMOOP },
                    tierTwoInNetwork: { individual: row.TEHBInnTier2IndividualMOOP, familyPerPerson: row.TEHBInnTier2FamilyPerPersonMOOP, familyPerGroup: row.TEHBInnTier2FamilyPerGroupMOOP },
                    outNetwork: { individual: row.TEHBOutOfNetIndividualMOOP, familyPerPerson: row.TEHBOutOfNetFamilyPerPersonMOOP, familyPerGroup: row.TEHBOutOfNetFamilyPerGroupMOOP },
                    combined: { individual: row.TEHBCombInnOonIndividualMOOP, familyPerPerson: row.TEHBCombInnOonFamilyPerPersonMOOP, familyPerGroup: row.TEHBCombInnOonFamilyPerGroupMOOP },
                }))
                .with([true, false], () => ({
                    medicalDrugIntegrated: false,
                    medicalTierOneInNetwork: { individual: row.MEHBInnTier1IndividualMOOP, familyPerPerson: row.MEHBInnTier1FamilyPerPersonMOOP, familyPerGroup: row.MEHBInnTier1FamilyPerGroupMOOP },
                    medicalTierTwoInNetwork: { individual: row.MEHBInnTier2IndividualMOOP, familyPerPerson: row.MEHBInnTier2FamilyPerPersonMOOP, familyPerGroup: row.MEHBInnTier2FamilyPerGroupMOOP },
                    medicalOutNetwork: { individual: row.MEHBOutOfNetIndividualMOOP, familyPerPerson: row.MEHBOutOfNetFamilyPerPersonMOOP, familyPerGroup: row.MEHBOutOfNetFamilyPerGroupMOOP },
                    medicalCombined: { individual: row.MEHBCombInnOonIndividualMOOP, familyPerPerson: row.MEHBCombInnOonFamilyPerPersonMOOP, familyPerGroup: row.MEHBCombInnOonFamilyPerGroupMOOP }, 
                    drugTierOneInNetwork: { individual: row.DEHBInnTier1IndividualMOOP, familyPerPerson: row.DEHBInnTier1FamilyPerPersonMOOP, familyPerGroup: row.DEHBInnTier1FamilyPerGroupMOOP },
                    drugTierTwoInNetwork: { individual: row.DEHBInnTier2IndividualMOOP, familyPerPerson: row.DEHBInnTier2FamilyPerPersonMOOP, familyPerGroup: row.DEHBInnTier2FamilyPerGroupMOOP },
                    drugOutNetwork: { individual: row.DEHBOutOfNetIndividualMOOP, familyPerPerson: row.DEHBOutOfNetFamilyPerPersonMOOP, familyPerGroup: row.DEHBOutOfNetFamilyPerGroupMOOP },
                    drugCombined: { individual: row.DEHBCombInnOonIndividualMOOP, familyPerPerson: row.DEHBCombInnOonFamilyPerPersonMOOP, familyPerGroup: row.DEHBCombInnOonFamilyPerGroupMOOP },   
                }))
                .run();
        }
    },
    preprocessCostSharingData: (chunk: string) => {
        const parseLimitUnit = (val?: string) => {
            if (!val) return undefined;
            const parser = new nearley.Parser(nearley.Grammar.fromCompiled(costSharingLimitUnitGrammar));
            let res = parser.feed(val).finish()[0] as Omit<BenefitItemLimit, "quantity">;
            if (pluralize.isPlural(res.frequencyUnit)) {
                res.frequencyUnit = pluralize.singular(res.frequencyUnit) as any;
            }

            return res;
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
            BenefitName: (val: string) => val.trim().replace(/[\t""\.]/g, ""),
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
            LimitUnit: parseLimitUnit,
            Exclusions: (val?: string) => val ?? undefined,
            Explanation: (val?: string) => val ?? undefined,
            IsExclFromInnMOOP: (val?: string) => val === "Yes",
            IsExclFromOonMOOP: (val?: string) => val === "Yes",
        } as const;

        type TransformedData = {[Property in keyof typeof TRANSFORMATION_MAP]: ReturnType<typeof TRANSFORMATION_MAP[Property]>}
            & {[Property in keyof Omit<RawCostSharingModel, keyof typeof TRANSFORMATION_MAP>]: RawCostSharingModel[Property]};      

        const result = dataForge.fromCSV(chunk)
            .transformSeries<TransformedData>(TRANSFORMATION_MAP)
            .aggregate<Record<string, CostSharingPreprocessModel>>({}, (prev, row) => {
                const key = row.PlanId.join('-');
                if (!prev[key]) {
                    prev[key] = {
                        standardComponentId: row.PlanId[0],
                        variantId: row.PlanId[1],
                        benefits: {},
                    };
                }

                const ehbInfo: EHBInfo | undefined = row.IsEHB
                    ? { isExcludedFromInNetworkMOOP: row.IsExclFromInnMOOP, isExcludedFromOutOfNetworkMOOP: row.IsExclFromOonMOOP }
                    : undefined

                const limit: BenefitItemLimit | undefined = row.LimitUnit
                    ? { quantity: row.LimitQty!, ...row.LimitUnit }
                    : undefined;
            
                const inNetworkTierTwo = compact([row.CopayInnTier2, row.CoinsInnTier2]) as [] | [BenefitItemCostSharingScheme] | [BenefitItemCostSharingScheme, BenefitItemCostSharingScheme];

                const inNetworkTierOne = compact([row.CoinsInnTier1, row.CopayInnTier1]);
                const outOfNetwork = compact([row.CoinsOutofNet, row.CopayOutofNet]);

                const result: CostSharingBenefit = row.IsCovered && !isEmpty(inNetworkTierOne) && !isEmpty(outOfNetwork)
                    ? {
                        covered: true,
                        ...createSinglePropertyObject("exclusions", row.Exclusions),
                        ...createSinglePropertyObject("explanations", row.Explanation),
                        ...createSinglePropertyObject("limit", limit),
                        inNetworkTierOne: inNetworkTierOne as [BenefitItemCostSharingScheme] | [BenefitItemCostSharingScheme, BenefitItemCostSharingScheme],
                        outOfNetwork: outOfNetwork as [BenefitItemCostSharingScheme] | [BenefitItemCostSharingScheme, BenefitItemCostSharingScheme],
                        ...(isEmpty(inNetworkTierTwo) ? {} : { inNetworkTierTwo: inNetworkTierTwo as [BenefitItemCostSharingScheme] | [BenefitItemCostSharingScheme, BenefitItemCostSharingScheme] }),
                        ...createSinglePropertyObject("ehbInfo", ehbInfo),
                    } : { covered: false };

                prev[key].benefits[row.BenefitName] = result;
                return prev;
            });

        return result;
    },
    preprocessRateData: (chunk: string) => {
        const numberTransformer = (val?: string) => val ? Number(val) : undefined;
    
        const TRANSFORMATION_MAP = {
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
    
                const res = parseInt(matches[1])?.toString();
                if (!res) {
                    throw `RatingAreaId on row ${index} has invalid value ${value}`;
                }
    
                return res;
            }
        };
    
        const ratingAreaStringRegex = /^Rating Area (\d{1,2})$/;
    
        type TransformedData = {[Property in keyof RawRateModel]: Property extends keyof typeof TRANSFORMATION_MAP ? ReturnType<typeof TRANSFORMATION_MAP[Property]> : RawRateModel[Property]};

        return dataForge.fromCSV(chunk)
            .transformSeries<TransformedData>(TRANSFORMATION_MAP)
            .aggregate<{[key: string]: RatePreprocessModel}>({}, (prev, row) => {
                if (!prev[row.PlanId]) {
                    prev[row.PlanId] = {
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
                            target: "family",
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
                            target: "individual",
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
                    if (rateDetail.target !== 'individual') {
                        throw "Invalid code path.";
                    }
    
                    rateDetail.rate[ageIndex] = row.IndividualRate;
                    rateDetail.tobaccoRate[ageIndex] = !row.Tobacco || row.Tobacco === "No Preference"
                        ? row.IndividualRate
                        : row.IndividualTobaccoRate!;
                }
    
                return prev;
            });
    }
}

expose(worker);