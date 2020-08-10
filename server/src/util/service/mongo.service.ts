import { connect, MongoClient } from 'mongodb';
import { Inject } from "../decorators/inject.decorator";
import { Injectable } from "../decorators/injectable.decorator";
import { Config } from "./config.service";

@Injectable(MongoService, [], target => target.initialize())
export class MongoService {
    @Inject(Config) private readonly config!: Config;
    client!: MongoClient;

    async initialize() {
        this.client = await connect(this.config.mongoDbAddress, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
}