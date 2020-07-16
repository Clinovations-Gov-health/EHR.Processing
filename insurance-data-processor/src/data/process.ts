import dataForge = require('data-forge');
import 'data-forge-fs';
import { promises as fs } from 'fs';
import { PostPreprocessInsuranceSchema } from './interface/raw/post-preprocess-insurance';
import { InsurancePlan, IntDefns } from './interface/db/insurance';
import { identity, set } from 'lodash';
import numeral from 'numeral';
import nearley from 'nearley';
import grammar from './grammar';

/**
 * The columns where every row must have a valid value.
 */
const REQUIRED_COLUMNS = ['Medical Deductible - Individual - 73 Percent', 'Drug Deductible - Individual - 73 Percent', 'Medical Deductible - Family - 73 Percent', 'Drug Deductible - Family - 73 Percent', 'Medical Deductible - Family (Per Person) - 73 Percent', 'Drug Deductible - Family (Per Person) - 73 Percent', 'Medical Maximum Out Of Pocket - Individual - 73 Percent', 'Drug Maximum Out Of Pocket - Individual - 73 Percent', 'Medical Maximum Out Of Pocket - Family - 73 Percent', 'Drug Maximum Out Of Pocket - Family - 73 Percent', 'Medical Maximum Out Of Pocket - Family (Per Person) - 73 Percent', 'Drug Maximum Out Of Pocket - Family (Per Person) - 73 Percent', 'Primary Care Physician - 73 Percent', 'Specialist - 73 Percent', 'Emergency Room - 73 Percent', 'Inpatient Facility - 73 Percent', 'Inpatient Physician - 73 Percent', 'Generic Drugs - 73 Percent', 'Preferred Brand Drugs - 73 Percent', 'Non-preferred Brand Drugs - 73 Percent', 'Specialty Drugs - 73 Percent', 'Medical Deductible - Individual - 87 Percent', 'Drug Deductible - Individual - 87 Percent', 'Medical Deductible - Family - 87 Percent', 'Drug Deductible - Family - 87 Percent', 'Medical Deductible - Family (Per Person) - 87 Percent', 'Drug Deductible - Family (Per Person) - 87 Percent', 'Medical Maximum Out Of Pocket - Individual - 87 Percent', 'Drug Maximum Out Of Pocket - Individual - 87 Percent', 'Medical Maximum Out Of Pocket - Family - 87 Percent', 'Drug Maximum Out Of Pocket - Family - 87 Percent', 'Medical Maximum Out Of Pocket - Family (Per Person) - 87 Percent', 'Drug Maximum Out Of Pocket - Family (Per Person) - 87 Percent', 'Primary Care Physician - 87 Percent', 'Specialist - 87 Percent', 'Emergency Room - 87 Percent', 'Inpatient Facility - 87 Percent', 'Inpatient Physician - 87 Percent', 'Generic Drugs - 87 Percent', 'Preferred Brand Drugs - 87 Percent', 'Non-preferred Brand Drugs - 87 Percent', 'Specialty Drugs - 87 Percent', 'Medical Deductible - Individual - 94 Percent', 'Drug Deductible - Individual - 94 Percent', 'Medical Deductible - Family - 94 Percent', 'Drug Deductible - Family - 94 Percent', 'Medical Deductible - Family (Per Person) - 94 Percent', 'Drug Deductible - Family (Per Person) - 94 Percent', 'Medical Maximum Out Of Pocket -individual - 94 Percent', 'Drug Maximum Out Of Pocket - individual - 94 Percent', 'Medical Maximum Out Of Pocket - family - 94 Percent', 'Drug Maximum Out Of Pocket - Family  - 94 Percent', 'Medical Maximum Out Of Pocket - Family (Per Person) - 94 Percent', 'Drug Maximum Out Of Pocket - Family (Per Person) - 94 Percent', 'Primary Care Physician - 94 Percent', 'Specialist - 94 Percent', 'Emergency Room - 94 Percent', 'Inpatient Facility - 94 Percent', 'Inpatient Physician - 94 Percent', 'Generic Drugs - 94 Percent', 'Preferred Brand Drugs - 94 Percent', 'Non-preferred Brand Drugs - 94 Percent', 'Specialty Drugs - 94 Percent'] as const;
/**
 * Useless columns for our purposes.
 */
const COLUMNS_TO_DROP = [
    "FIPS County Code",
    "County Name",
    "Child Only Offering",
    "Source",
    "Plan Brochure URL",
    "Drug Formulary URL",
    "Adult Dental",
    "Child Dental",
    'Accreditation',
    'Premium Scenarios',
    'Standard Plan Cost Sharing',
    '73 Percent Actuarial Value Silver Plan Cost Sharing',
    '87 Percent Actuarial Value Silver Plan Cost Sharing',
    '94 Percent Actuarial Value Silver Plan Cost Sharing'
];

/**
 * Preprocesses the CSV dataframe by removing invalid rows and columns. Stores the result as a JSON file.
 */
export function preprocess(inputFilePath: string, outputFilePath: string) {
    dataForge.readFileSync(inputFilePath)
        .parseCSV()
        .dropSeries(COLUMNS_TO_DROP)
        .where(row => !REQUIRED_COLUMNS.every(key => row[key] === ""))
        .asJSON()
        .writeFileSync(outputFilePath);
}

function parseCostSharingValue(val: string): IntDefns {
    const grammarCompiler = new nearley.Parser(
        nearley.Grammar.fromCompiled(grammar),
    );

    return grammarCompiler.feed(val).finish()[0];
}

/**
 * Fields that are one-to-one mapped from raw data to the new data.
 */
const fieldMap: Record<keyof PostPreprocessInsuranceSchema[0], readonly [string, (val: string) => any]> = {
    "State Code": ["stateCode", identity],
    "Metal Level": ["metalLevel", identity],
    "Issuer Name": ["issuerName", identity],
    "HIOS Issuer ID": ["HIOSIssuerID", identity],
    "Plan ID (Standard Component)": ["planID", identity],
    "Plan Marketing Name": ["planMarketingName", identity],
    "Plan Type": ["planType", identity],
    "Rating Area": ["ratingArea", (val: string) => parseInt(val.split(' ')[-1])],
    "Customer Service Phone Number Local": ["customerServicePhoneNumberLocal", identity],
    "Customer Service Phone Number Toll Free": ["customerServicePhoneNumberTollFree", identity],
    "Customer Service Phone Number TTY": ["customerServicePhoneNumberTollFree", (val: string) => val.length === 0 ? null : val],
    "Network URL": ["networkURL", identity],
    "Summary of Benefits URL": ["summaryBenefitsURL", identity],
    "EHB Percent of Total Premium": ["ehbPercentOfTotalPremium", (val: string) => numeral(val).value()],

    "Premium Child Age 0-14": ["premiumScenarios.individual14", (val: string) => numeral(val).value()],
    "Premium Child Age 18": ["premiumScenarios.individual18", (val: string) => numeral(val).value()],
    "Premium Adult Individual Age 21": ["premiumScenarios.individual21[0]", (val: string) => numeral(val).value()],
    "Premium Adult Individual Age 27": ["premiumScenarios.individual27", (val: string) => numeral(val).value()],
    "Premium Adult Individual Age 30": ["premiumScenarios.individual30[0]", (val: string) => numeral(val).value()],
    "Premium Adult Individual Age 40": ["premiumScenarios.individual40[0]", (val: string) => numeral(val).value()],
    "Premium Adult Individual Age 50": ["premiumScenarios.individual50[0]", (val: string) => numeral(val).value()],
    "Premium Adult Individual Age 60": ["premiumScenarios.individual60", (val: string) => numeral(val).value()],
    "Premium Couple 21": ["premiumScenarios.couple21[0]", (val: string) => numeral(val).value()],
    "Premium Couple 30": ["premiumScenarios.couple30[0]", (val: string) => numeral(val).value()],
    "Premium Couple 40": ["premiumScenarios.couple40[0]", (val: string) => numeral(val).value()],
    "Premium Couple 50": ["premiumScenarios.couple50[0]", (val: string) => numeral(val).value()],
    "Premium Couple 60": ["premiumScenarios.couple60", (val: string) => numeral(val).value()],
    "Couple+1 child, Age 21": ["premiumScenarios.couple21[1]", (val: string) => numeral(val).value()],
    "Couple+1 child, Age 30": ["premiumScenarios.couple30[1]", (val: string) => numeral(val).value()],
    "Couple+1 child, Age 40": ["premiumScenarios.couple40[1]", (val: string) => numeral(val).value()],
    "Couple+1 child, Age 50": ["premiumScenarios.couple50[1]", (val: string) => numeral(val).value()],
    "Couple+2 children, Age 21": ["premiumScenarios.couple21[2]", (val: string) => numeral(val).value()],
    "Couple+2 children, Age 30": ["premiumScenarios.couple30[2]", (val: string) => numeral(val).value()],
    "Couple+2 children, Age 40": ["premiumScenarios.couple40[2]", (val: string) => numeral(val).value()],
    "Couple+2 children, Age 50": ["premiumScenarios.couple50[2]", (val: string) => numeral(val).value()],
    "Couple+3 or more Children, Age 21": ["premiumScenarios.couple21[3]", (val: string) => numeral(val).value()],
    "Couple+3 or more Children, Age 30": ["premiumScenarios.couple30[3]", (val: string) => numeral(val).value()],
    "Couple+3 or more Children, Age 40": ["premiumScenarios.couple40[3]", (val: string) => numeral(val).value()],
    "Couple+3 or more Children, Age 50": ["premiumScenarios.couple50[3]", (val: string) => numeral(val).value()],
    "Individual+1 child, Age 21": ["premiumScenarios.individual21[1]", (val: string) => numeral(val).value()],
    "Individual+1 child, Age 30": ["premiumScenarios.individual30[1]", (val: string) => numeral(val).value()],
    "Individual+1 child, Age 40": ["premiumScenarios.individual40[1]", (val: string) => numeral(val).value()],
    "Individual+1 child, Age 50": ["premiumScenarios.individual50[1]", (val: string) => numeral(val).value()],
    "Individual+2 children, Age 21": ["premiumScenarios.individual21[2]", (val: string) => numeral(val).value()],
    "Individual+2 children, Age 30": ["premiumScenarios.individual30[2]", (val: string) => numeral(val).value()],
    "Individual+2 children, Age 40": ["premiumScenarios.individual40[2]", (val: string) => numeral(val).value()],
    "Individual+2 children, Age 50": ["premiumScenarios.individual50[2]", (val: string) => numeral(val).value()],
    "Individual+3 or more children, Age 21": ["premiumScenarios.individual21[3]", (val: string) => numeral(val).value()],
    "Individual+3 or more children, Age 30": ["premiumScenarios.individual30[3]", (val: string) => numeral(val).value()],
    "Individual+3 or more children, Age 40": ["premiumScenarios.individual40[3]", (val: string) => numeral(val).value()],
    "Individual+3 or more children, Age 50": ["premiumScenarios.individual50[3]", (val: string) => numeral(val).value()],

    "Medical Deductible - Individual - Standard": ["standPlanCostSharing.medDeductibleInd", parseCostSharingValue],
    "Drug Deductible - Individual - Standard": ["standPlanCostSharing.drugDeductibleInd", parseCostSharingValue],
    "Medical Deductible - Family - Standard": ["standPlanCostSharing.medDeductibleFam", parseCostSharingValue],
    "Drug Deductible - Family - Standard": ["standPlanCostSharing.drugDeductibleFam", parseCostSharingValue],
    "Medical Deductible - Family (Per Person) - Standard": ["standPlanCostSharing.medDeductibleFamPerPerson", parseCostSharingValue],
    "Drug Deductible - Family (Per Person) - Standard": ["standPlanCostSharing.drugDeductibleFamPerPerson", parseCostSharingValue],
    "Medical Maximum Out Of Pocket - Individual - Standard": ["standPlanCostSharing.medMOOPInd", parseCostSharingValue],
    "Drug Maximum Out Of Pocket - Individual - Standard": ["standPlanCostSharing.drugMOOPInd", parseCostSharingValue],
    "Medical Maximum Out Of Pocket - Family - Standard": ["standPlanCostSharing.medMOOPFam", parseCostSharingValue],
    "Drug Maximum Out Of Pocket - Family - Standard": ["standPlanCostSharing.drugMOOPFam", parseCostSharingValue],
    "Medical Maximum Out Of Pocket - Family (Per Person) - Standard": ["standPlanCostSharing.medMOOPFamPerPerson", parseCostSharingValue],
    "Drug Maximum Out Of Pocket - Family (Per Person) - Standard": ["standPlanCostSharing.drugMOOPFamPerPerson", parseCostSharingValue],
    "Primary Care Physician - Standard": ["standPlanCostSharing.primCarePhys", parseCostSharingValue],
    "Specialist - Standard": ["standPlanCostSharing.spec", parseCostSharingValue],
    "Emergency Room - Standard": ["standPlanCostSharing.emergencyRoom", parseCostSharingValue],
    "Inpatient Facility - Standard": ["standPlanCostSharing.inPatientFac", parseCostSharingValue],
    "Inpatient Physician - Standard": ["standPlanCostSharing.inPatientPhys", parseCostSharingValue],
    "Generic Drugs - Standard": ["standPlanCostSharing.genericDrugs", parseCostSharingValue],
    "Preferred Brand Drugs - Standard": ["standPlanCostSharing.prefDrugs", parseCostSharingValue],
    "Non-preferred Brand Drugs - Standard": ["standPlanCostSharing.nonprefDrug", parseCostSharingValue],
    "Specialty Drugs - Standard": ["standPlanCostSharing.specDrug", parseCostSharingValue],

    "Medical Deductible - Individual - 73 Percent": ["silver73PlanCostSharing.medDeductibleInd", parseCostSharingValue],
    "Drug Deductible - Individual - 73 Percent": ["silver73PlanCostSharing.drugDeductibleInd", parseCostSharingValue],
    "Medical Deductible - Family - 73 Percent": ["silver73PlanCostSharing.medDeductibleFam", parseCostSharingValue],
    "Drug Deductible - Family - 73 Percent": ["silver73PlanCostSharing.drugDeductibleFam", parseCostSharingValue],
    "Medical Deductible - Family (Per Person) - 73 Percent": ["silver73PlanCostSharing.medDeductibleFamPerPerson", parseCostSharingValue],
    "Drug Deductible - Family (Per Person) - 73 Percent": ["silver73PlanCostSharing.drugDeductibleFamPerPerson", parseCostSharingValue],
    "Medical Maximum Out Of Pocket - Individual - 73 Percent": ["silver73PlanCostSharing.medMOOPInd", parseCostSharingValue],
    "Drug Maximum Out Of Pocket - Individual - 73 Percent": ["silver73PlanCostSharing.drugMOOPInd", parseCostSharingValue],
    "Medical Maximum Out Of Pocket - Family - 73 Percent": ["silver73PlanCostSharing.medMOOPFam", parseCostSharingValue],
    "Drug Maximum Out Of Pocket - Family - 73 Percent": ["silver73PlanCostSharing.drugMOOPFam", parseCostSharingValue],
    "Medical Maximum Out Of Pocket - Family (Per Person) - 73 Percent": ["silver73PlanCostSharing.medMOOPFamPerPerson", parseCostSharingValue],
    "Drug Maximum Out Of Pocket - Family (Per Person) - 73 Percent": ["silver73PlanCostSharing.drugMOOPFamPerPerson", parseCostSharingValue],
    "Primary Care Physician - 73 Percent": ["silver73PlanCostSharing.primCarePhys", parseCostSharingValue],
    "Specialist - 73 Percent": ["silver73PlanCostSharing.spec", parseCostSharingValue],
    "Emergency Room - 73 Percent": ["silver73PlanCostSharing.emergencyRoom", parseCostSharingValue],
    "Inpatient Facility - 73 Percent": ["silver73PlanCostSharing.inPatientFac", parseCostSharingValue],
    "Inpatient Physician - 73 Percent": ["silver73PlanCostSharing.inPatientPhys", parseCostSharingValue],
    "Generic Drugs - 73 Percent": ["silver73PlanCostSharing.genericDrugs", parseCostSharingValue],
    "Preferred Brand Drugs - 73 Percent": ["silver73PlanCostSharing.prefDrugs", parseCostSharingValue],
    "Non-preferred Brand Drugs - 73 Percent": ["silver73PlanCostSharing.nonprefDrug", parseCostSharingValue],
    "Specialty Drugs - 73 Percent": ["silver73PlanCostSharing.specDrug", parseCostSharingValue],

    "Medical Deductible - Individual - 87 Percent": ["silver87PlanCostSharing.medDeductibleInd", parseCostSharingValue],
    "Drug Deductible - Individual - 87 Percent": ["silver87PlanCostSharing.drugDeductibleInd", parseCostSharingValue],
    "Medical Deductible - Family - 87 Percent": ["silver87PlanCostSharing.medDeductibleFam", parseCostSharingValue],
    "Drug Deductible - Family - 87 Percent": ["silver87PlanCostSharing.drugDeductibleFam", parseCostSharingValue],
    "Medical Deductible - Family (Per Person) - 87 Percent": ["silver87PlanCostSharing.medDeductibleFamPerPerson", parseCostSharingValue],
    "Drug Deductible - Family (Per Person) - 87 Percent": ["silver87PlanCostSharing.drugDeductibleFamPerPerson", parseCostSharingValue],
    "Medical Maximum Out Of Pocket - Individual - 87 Percent": ["silver87PlanCostSharing.medMOOPInd", parseCostSharingValue],
    "Drug Maximum Out Of Pocket - Individual - 87 Percent": ["silver87PlanCostSharing.drugMOOPInd", parseCostSharingValue],
    "Medical Maximum Out Of Pocket - Family - 87 Percent": ["silver87PlanCostSharing.medMOOPFam", parseCostSharingValue],
    "Drug Maximum Out Of Pocket - Family - 87 Percent": ["silver87PlanCostSharing.drugMOOPFam", parseCostSharingValue],
    "Medical Maximum Out Of Pocket - Family (Per Person) - 87 Percent": ["silver87PlanCostSharing.medMOOPFamPerPerson", parseCostSharingValue],
    "Drug Maximum Out Of Pocket - Family (Per Person) - 87 Percent": ["silver87PlanCostSharing.drugMOOPFamPerPerson", parseCostSharingValue],
    "Primary Care Physician - 87 Percent": ["silver87PlanCostSharing.primCarePhys", parseCostSharingValue],
    "Specialist - 87 Percent": ["silver87PlanCostSharing.spec", parseCostSharingValue],
    "Emergency Room - 87 Percent": ["silver87PlanCostSharing.emergencyRoom", parseCostSharingValue],
    "Inpatient Facility - 87 Percent": ["silver87PlanCostSharing.inPatientFac", parseCostSharingValue],
    "Inpatient Physician - 87 Percent": ["silver87PlanCostSharing.inPatientPhys", parseCostSharingValue],
    "Generic Drugs - 87 Percent": ["silver87PlanCostSharing.genericDrugs", parseCostSharingValue],
    "Preferred Brand Drugs - 87 Percent": ["silver87PlanCostSharing.prefDrugs", parseCostSharingValue],
    "Non-preferred Brand Drugs - 87 Percent": ["silver87PlanCostSharing.nonprefDrug", parseCostSharingValue],
    "Specialty Drugs - 87 Percent": ["silver87PlanCostSharing.specDrug", parseCostSharingValue],

    "Medical Deductible - Individual - 94 Percent": ["silver94PlanCostSharing.medDeductibleInd", parseCostSharingValue],
    "Drug Deductible - Individual - 94 Percent": ["silver94PlanCostSharing.drugDeductibleInd", parseCostSharingValue],
    "Medical Deductible - Family - 94 Percent": ["silver94PlanCostSharing.medDeductibleFam", parseCostSharingValue],
    "Drug Deductible - Family - 94 Percent": ["silver94PlanCostSharing.drugDeductibleFam", parseCostSharingValue],
    "Medical Deductible - Family (Per Person) - 94 Percent": ["silver94PlanCostSharing.medDeductibleFamPerPerson", parseCostSharingValue],
    "Drug Deductible - Family (Per Person) - 94 Percent": ["silver94PlanCostSharing.drugDeductibleFamPerPerson", parseCostSharingValue],
    "Medical Maximum Out Of Pocket -individual - 94 Percent": ["silver94PlanCostSharing.medMOOPInd", parseCostSharingValue],
    "Drug Maximum Out Of Pocket - individual - 94 Percent": ["silver94PlanCostSharing.drugMOOPInd", parseCostSharingValue],
    "Medical Maximum Out Of Pocket - family - 94 Percent": ["silver94PlanCostSharing.medMOOPFam", parseCostSharingValue],
    "Drug Maximum Out Of Pocket - Family  - 94 Percent": ["silver94PlanCostSharing.drugMOOPFam", parseCostSharingValue],
    "Medical Maximum Out Of Pocket - Family (Per Person) - 94 Percent": ["silver94PlanCostSharing.medMOOPFamPerPerson", parseCostSharingValue],
    "Drug Maximum Out Of Pocket - Family (Per Person) - 94 Percent": ["silver94PlanCostSharing.drugMOOPFamPerPerson", parseCostSharingValue],
    "Primary Care Physician - 94 Percent": ["silver94PlanCostSharing.primCarePhys", parseCostSharingValue],
    "Specialist - 94 Percent": ["silver94PlanCostSharing.spec", parseCostSharingValue],
    "Emergency Room - 94 Percent": ["silver94PlanCostSharing.emergencyRoom", parseCostSharingValue],
    "Inpatient Facility - 94 Percent": ["silver94PlanCostSharing.inPatientFac", parseCostSharingValue],
    "Inpatient Physician - 94 Percent": ["silver94PlanCostSharing.inPatientPhys", parseCostSharingValue],
    "Generic Drugs - 94 Percent": ["silver94PlanCostSharing.genericDrugs", parseCostSharingValue],
    "Preferred Brand Drugs - 94 Percent": ["silver94PlanCostSharing.prefDrugs", parseCostSharingValue],
    "Non-preferred Brand Drugs - 94 Percent": ["silver94PlanCostSharing.nonprefDrug", parseCostSharingValue],
    "Specialty Drugs - 94 Percent": ["silver94PlanCostSharing.specDrug", parseCostSharingValue],
} as const;

export async function convert(inputFilePath: string): Promise<InsurancePlan[]> {
    const insurances: PostPreprocessInsuranceSchema = JSON.parse(await fs.readFile(inputFilePath, "utf-8"));

    return insurances.map(insurance => {
        return Object.entries(fieldMap).reduce((prev, [rawKey, [targetKey, convertFn]]) => {
            const newVal = convertFn(insurance[rawKey as keyof PostPreprocessInsuranceSchema[0]]);
            if (newVal !== null && newVal !== undefined) {
                set(prev, targetKey, convertFn(insurance[rawKey as keyof PostPreprocessInsuranceSchema[0]]));
            }
            return prev;
        }, {} as InsurancePlan);
    })
}

