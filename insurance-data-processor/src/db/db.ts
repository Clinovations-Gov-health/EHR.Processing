import mongoose from 'mongoose';
import { InsurancePlan } from '../data/interface/db/insurance';
import { InsurancePlanModel } from './model/insurance-plan';
import { chunk } from 'lodash';

const mongoConnectionString = "mongodb://localhost:27017/Clinovations?replicaSet=rs0";

/**
 * Loads the insurance plan data into the database. If `replace` is set, the `InsurancePlan` is cleared before loading.s
 */
export async function loadInsurancePlanData(data: InsurancePlan[], replace: boolean = true) {
    mongoose.connect(mongoConnectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    if (replace) {
        await InsurancePlanModel.deleteMany({}).exec();
    }

    const partitionedData = chunk(data, 10);

    for (const chunk of partitionedData) {
        await InsurancePlanModel.create(...chunk);
    }

    mongoose.disconnect();
}
