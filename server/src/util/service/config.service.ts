import { Injectable } from "../decorators/injectable.decorator";
import dotenv from 'dotenv';

@Injectable()
export class Config {
    readonly mongoDbAddress: string = "";
    readonly jsonWebTokenKey: string = "";

    constructor() {
        const rawConfig = dotenv.config({ path: ".env" });
        console.log(`Reading env config file..`); 
        if (rawConfig.error) {
            console.log(`error env config file.`); 
            throw rawConfig.error;
        }

        Object.keys(this).forEach(key => Reflect.set(this, key, rawConfig.parsed![key]));
        console.log(`Your jsonWebTokenKey is ${process.env.jsonWebTokenKey}`); 
        console.log(`Your this.jsonWebTokenKey is ${this.jsonWebTokenKey}`); 
        console.log(`Your mongoDbAddress is ${process.env.mongoDbAddress}`); 
        console.log(`Your this.mongoDbAddress is ${this.mongoDbAddress}`); 
    }
}