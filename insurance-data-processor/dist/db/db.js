"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadInsurancePlanData = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const insurance_plan_1 = require("./model/insurance-plan");
const lodash_1 = require("lodash");
const mongoConnectionString = "mongodb://localhost:27017/Clinovations?replicaSet=rs0";
async function loadInsurancePlanData(data, replace = true) {
    mongoose_1.default.connect(mongoConnectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    if (replace) {
        await insurance_plan_1.InsurancePlanModel.deleteMany({}).exec();
    }
    const partitionedData = lodash_1.chunk(data, 10);
    for (const chunk of partitionedData) {
        await insurance_plan_1.InsurancePlanModel.create(...chunk);
    }
    mongoose_1.default.disconnect();
}
exports.loadInsurancePlanData = loadInsurancePlanData;
//# sourceMappingURL=db.js.map