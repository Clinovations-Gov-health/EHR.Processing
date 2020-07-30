import { Injectable } from "../decorators/injectable.decorator";
import { inject } from "inversify";
import { Config } from "./config.service";
import { connect, MongoClient } from 'mongodb';

@Injectable(MongoService, (service: MongoService) => service.initialize())
export class MongoService {
    @inject(Config) private readonly config!: Config;
    client!: MongoClient;

    async initialize() {
        this.client = await connect(this.config.mongoDbAddress, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
}