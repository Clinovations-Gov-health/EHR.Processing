import { Document } from "mongoose";
export declare type IntDefns = [{
    isKnown: boolean;
    includedWithMedical?: boolean;
    value?: number;
    isPercent?: boolean;
    deductible?: "with" | "after" | "non";
    per?: "day" | "stay" | "once";
}] | [{
    isKnown: boolean;
    includedWithMedical?: boolean;
    value?: number;
    isPercent?: boolean;
    deductible?: "with" | "after" | "non";
    per?: "day" | "stay" | "once";
}, {
    isKnown: boolean;
    includedWithMedical?: boolean;
    value?: number;
    isPercent?: boolean;
    deductible?: "with" | "after" | "non";
    per?: "day" | "stay" | "once";
}];
export interface InsurancePlan extends Document {
    stateCode: string;
    metalLevel: string;
    issuerName: string;
    HIOSIssuerID: string;
    planID: string;
    planMarketingName: string;
    planType: "PPO" | "EPO" | "POS" | "HMO";
    ratingArea?: number;
    customerServicePhoneNumberLocal?: string;
    customerServicePhoneNumberTollFree?: string;
    customerServicePhoneNumberTTY?: string;
    networkURL: string;
    summaryBenefitsURL: string;
    ehbPercentOfTotalPremium: number;
    premiumScenarios: {
        individual14: number;
        individual18: number;
        individual21: [number, number, number, number];
        individual27: number;
        individual30: [number, number, number, number];
        individual40: [number, number, number, number];
        individual50: [number, number, number, number];
        individual60: number;
        couple21: [number, number, number, number];
        couple30: [number, number, number, number];
        couple40: [number, number, number, number];
        couple50: [number, number, number, number];
        couple60: number;
    };
    standPlanCostSharing: PlanCostSharing;
    silver73PlanCostSharing: PlanCostSharing;
    silver87PlanCostSharing: PlanCostSharing;
    silver94PlanCostSharing: PlanCostSharing;
}
export interface PlanCostSharing {
    medDeductibleInd: IntDefns;
    drugDeductibleInd: IntDefns;
    medDeductibleFam: IntDefns;
    drugDeductibleFam: IntDefns;
    medDeductibleFamPerPerson: IntDefns;
    drugDeductibleFamPerPerson: IntDefns;
    medMOOPInd: IntDefns;
    drugMOOPInd: IntDefns;
    medMOOPFam: IntDefns;
    drugMOOPFam: IntDefns;
    medMOOPFamPerPerson: IntDefns;
    drugMOOPFamPerPerson: IntDefns;
    primCarePhys: IntDefns;
    spec: IntDefns;
    emergencyRoom: IntDefns;
    inPatientFac: IntDefns;
    inPatientPhys: IntDefns;
    genericDrugs: IntDefns;
    prefDrugs: IntDefns;
    nonprefDrug: IntDefns;
    specDrug: IntDefns;
}
