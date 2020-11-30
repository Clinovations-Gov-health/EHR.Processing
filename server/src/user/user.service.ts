import { Inject } from "../util/decorators/inject.decorator";
import { Injectable } from "../util/decorators/injectable.decorator";
import { MongoService } from "../util/service/mongo.service";
import { CreateUserPayload, LoginPayload, UpdatePayload } from "./interface/payload";
import { UserModel } from "./interface/user";
import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Config } from "../util/service/config.service";
import { ObjectId, UpdateQuery } from "mongodb";
import { Claim } from "./interface/claims";

@Injectable()
export class UserService {
    @Inject(MongoService) private readonly mongoService!: MongoService;
    @Inject('Fastify') private readonly fastify!: FastifyInstance;
    @Inject(Config) private readonly config!: Config;

    async createUser(userInfo: CreateUserPayload) {
        // Ensures that the user doesn't already exist.
        const coll = this.mongoService.client.db('Clinovations').collection<UserModel>('User');
        if (await coll.countDocuments({ username: userInfo.username }) !== 0) {
            throw this.fastify.httpErrors.badRequest('An user with the same username already exists.');
        }

        const transformedPayload: Omit<UserModel, "_id"> = {
            ...userInfo,
            password: await bcrypt.hash(userInfo.password, 5),
            lastRecommendPlans: null,
            claims: [],
        };

        const saveResult = await coll.insertOne(transformedPayload);

        return { token: jwt.sign(saveResult.insertedId.toHexString(), this.config.jsonWebTokenKey) };
    }

    async login(username: string, password: string) {
        const coll = this.mongoService.client.db('Clinovations').collection<UserModel>('User');
        const user = await coll.findOne({ username: username });
        if (!user) {
            throw this.fastify.httpErrors.badRequest("Invalid username.");
        } else if (!await bcrypt.compare(password, user.password)) {
            throw this.fastify.httpErrors.badRequest("Wrong password.");
        }

        return { token: jwt.sign(user._id?.toHexString()!, this.config.jsonWebTokenKey) };
    }

    async updateUser(userId: string, updates: UpdateQuery<UserModel>) {
        const coll = this.mongoService.client.db('Clinovations').collection<UserModel>('User');
        await coll.findOneAndUpdate({ _id: new ObjectId(userId) }, updates);
    }

    async updateClaimsData(userId: string, claims: Claim[]) {
        const coll = this.mongoService.client.db('Clinovations').collection<UserModel>('User');
        await coll.findOneAndUpdate({ _id: new ObjectId(userId) }, { $set: { claims } });
    }

    async getUser(userId: string) {
        const coll = this.mongoService.client.db('Clinovations').collection<UserModel>('User');
        const user = await coll.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            throw this.fastify.httpErrors.badRequest("Invalid username.");
        }
        return user;
    }

    async verifyJwtToken(token: string) {
        try {
            const id = jwt.verify(token, this.config.jsonWebTokenKey) as string;
            return id;
        } catch (e) {
            throw this.fastify.httpErrors.badRequest("Invalid token.");
        }
    }
}