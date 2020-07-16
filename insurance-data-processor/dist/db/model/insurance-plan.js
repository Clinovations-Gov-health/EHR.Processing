"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsurancePlanModel = void 0;
const mongoose_1 = require("mongoose");
const CostDefinitionSchema = new mongoose_1.Schema({
    isKnown: { type: Boolean, required: true },
    includedWithMedical: { type: Boolean },
    value: { type: Number },
    isPercent: { type: Boolean },
    deducible: { type: String, enum: ["with", "after", "non"] },
    per: { type: String, enum: ["day", "stay", "once"] },
}, {
    versionKey: false,
    _id: false,
    useNestedStrict: true,
});
const PlanCostSharingSchema = new mongoose_1.Schema({
    medDeductibleInd: [CostDefinitionSchema],
    drugDeductibleInd: [CostDefinitionSchema],
    medDeductibleFam: [CostDefinitionSchema],
    drugDeductibleFam: [CostDefinitionSchema],
    medDeductibleFamPerPerson: [CostDefinitionSchema],
    drugDeductibleFamPerPerson: [CostDefinitionSchema],
    medMOOPInd: [CostDefinitionSchema],
    drugMOOPInd: [CostDefinitionSchema],
    medMOOPFam: [CostDefinitionSchema],
    drugMOOPFam: [CostDefinitionSchema],
    medMOOPFamPerPerson: [CostDefinitionSchema],
    drugMOOPFamPerPerson: [CostDefinitionSchema],
    primCarePhys: [CostDefinitionSchema],
    spec: [CostDefinitionSchema],
    emergencyRoom: [CostDefinitionSchema],
    inPatientFac: [CostDefinitionSchema],
    inPatientPhys: [CostDefinitionSchema],
    genericDrugs: [CostDefinitionSchema],
    prefDrugs: [CostDefinitionSchema],
    nonprefDrug: [CostDefinitionSchema],
    specDrug: [CostDefinitionSchema],
}, {
    versionKey: false,
    _id: false,
    useNestedStrict: true,
});
const PremiumScenariosSchema = new mongoose_1.Schema({
    "individual14": { type: Number, required: true },
    "individual18": { type: Number, required: true },
    "individual21": { type: [Number], required: true },
    "individual27": { type: Number, required: true },
    "individual30": { type: [Number], required: true },
    "individual40": { type: [Number], required: true },
    "individual50": { type: [Number], required: true },
    "individual60": { type: Number, required: true },
    "couple21": { type: [Number], required: true },
    "couple30": { type: [Number], required: true },
    "couple40": { type: [Number], required: true },
    "couple50": { type: [Number], required: true },
    "couple60": { type: Number, required: true },
}, {
    versionKey: false,
    _id: false,
    useNestedStrict: true,
});
const InsurancePlanSchema = new mongoose_1.Schema({
    "stateCode": { type: String, required: true },
    "metalLevel": { type: String, required: true },
    "issuerName": { type: String, required: true },
    "HIOSIssuerID": { type: String, required: true },
    "planID": { type: String, required: true },
    "planMarketingName": { type: String, required: true },
    "planType": { type: String, enum: ["PPO", "EPO", "POS", "HMO"] },
    "ratingArea": { type: Number },
    "customerServicePhoneNumberLocal": { type: String },
    "customerServicePhoneNumberTollFree": { type: String },
    "customerServicePhoneNumberTTY": { type: String },
    "networkURL": { type: String, required: true },
    "summaryBenefitsURL": { type: String, required: true },
    "ehbPercentOfTotalPremium": { type: Number, required: true },
    "premiumScenarios": { type: PremiumScenariosSchema, required: true },
    "standPlanCostSharing": { type: PlanCostSharingSchema, required: true },
    "silver73PlanCostSharing": { type: PlanCostSharingSchema, required: true },
    "silver87PlanCostSharing": { type: PlanCostSharingSchema, required: true },
    "silver94PlanCostSharing": { type: PlanCostSharingSchema, required: true },
}, {
    versionKey: false,
    useNestedStrict: true,
});
exports.InsurancePlanModel = mongoose_1.model('InsurancePlan', InsurancePlanSchema, 'InsurancePlan');
//# sourceMappingURL=insurance-plan.js.map