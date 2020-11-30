import { Injectable } from "../decorators/injectable.decorator";
import dotenv from 'dotenv';

@Injectable()
export class Config {
    readonly mongoDbAddress: string = "";
    readonly jsonWebTokenKey: string = "";

    constructor() {
        const rawConfig = dotenv.config({ path: ".env" });
        if (rawConfig.error) {
            throw rawConfig.error;
        }

        Object.keys(this).forEach(key => Reflect.set(this, key, rawConfig.parsed![key]));
    }
}