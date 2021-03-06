import dotenv from 'dotenv';

export class Config {
    readonly mongoDbAddress: string = "";

    constructor() {
        const rawConfig = dotenv.config({ path: ".env" });
        if (rawConfig.error) {
            throw rawConfig.error;
        }

        Object.keys(this).forEach(key => Reflect.set(this, key, rawConfig.parsed![key]));
    }
}