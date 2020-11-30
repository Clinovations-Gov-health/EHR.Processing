import { Controller } from "../util/decorators/controller.decorator";
import { Inject } from "../util/decorators/inject.decorator";
import { Route } from "../util/decorators/route.decorator";
import { CreateUserPayload, LoginPayload, UpdateClaimsPayload, UpdatePayload } from "./interface/payload";
import { UserService } from "./user.service";
import { FastifyReply, FastifyRequest, FastifyInstance } from 'fastify';
import { assertEquals } from "typescript-is";
import { Claim } from "./interface/claims";
import { GetUserReturnPayload } from "./interface/return-payload";
import { fill, mapValues, zipObject } from "lodash";

@Controller('/user')
export class UserController {
    @Inject(UserService) private readonly userService!: UserService;
    @Inject('Fastify') private readonly fastify!: FastifyInstance;

    constructor() {
        this.createUserHandler.bind(this);
        this.loginHandler.bind(this);
        this.updateHandler.bind(this);
        this.updateClaimsHandler.bind(this);
        this.getUserHandler.bind(this);
    }

    @Route({
        method: 'POST',
        url: '/',
        schema: { body: {} },
        validatorCompiler: _ => {
            return (body: any) => {
                try {
                    assertEquals<CreateUserPayload>(body);
                    return { value: body };
                } catch (e) {
                    return { error: e };
                }
            };
        },
    })
    async createUserHandler(req: FastifyRequest<{ Body: CreateUserPayload }>, res: FastifyReply) {
        console.log(req.body);
        return await this.userService.createUser(req.body);
    }

    @Route({
        method: 'POST',
        url: '/login',
        schema: { body: {} },
        validatorCompiler: _ => {
            return (body: any) => {
                try {
                    assertEquals<LoginPayload>(body);
                    return { value: body };
                } catch (e) {
                    return { error: e };
                }
            };
        },
    })
    async loginHandler(req: FastifyRequest<{ Body: LoginPayload }>, res: FastifyReply) {
        console.log(req.body);
        return await this.userService.login(req.body.username, req.body.password);
    }

    @Route({
        method: 'PUT',
        url: '/update',
        schema: { body: {} },
        validatorCompiler: _ => {
            return (body: any) => {
                try {
                    assertEquals<UpdatePayload>(body);
                    return { value: body };
                } catch (e) {
                    return { error: e };
                }
            };
        },
    })
    async updateHandler(req: FastifyRequest<{ Body: UpdatePayload }>, res: FastifyReply) {
        const authCode = req.headers.authorization?.split(' ');
        if (!authCode || authCode.length !== 2) {
            throw this.fastify.httpErrors.badRequest("Invalid authorization info.");
        }

        const userId = await this.userService.verifyJwtToken(authCode[1]);

        await this.userService.updateUser(userId, { $unset: zipObject(
            ["age", "usesTobacco", "numChildren", "hasSpouse"],
            fill(Array(4), 1),
        ) });
        await this.userService.updateUser(userId, { $set: req.body });
        return "OK";
    }

    @Route({
        method: 'PUT',
        url: '/updateClaims',
        schema: { body: {} },
        validatorCompiler: _ => {
            return (body: any) => {
                try {
                    assertEquals<UpdateClaimsPayload>(body);
                    return { value: body };
                } catch (e) {
                    return { error: e };
                }
            };
        },
    })
    async updateClaimsHandler(req: FastifyRequest<{ Body: UpdateClaimsPayload }>, res: FastifyReply) {
        const authCode = req.headers.authorization?.split(' ');
        if (!authCode || authCode.length !== 2) {
            throw this.fastify.httpErrors.badRequest("Invalid authorization info.");
        }

        const userId = await this.userService.verifyJwtToken(authCode[1]);

        const transformedClaims: Claim[] = req.body.map(claim => ({
            ...claim,
            starts: new Date(Date.parse(claim.starts)),
            ends: new Date(Date.parse(claim.ends)),
        }));

        await this.userService.updateClaimsData(userId, transformedClaims);
        return "OK";
    }

    @Route({
        method: 'GET',
        url: '/',
    })
    async getUserHandler(req: FastifyRequest, res: FastifyReply): Promise<GetUserReturnPayload> {
        const authCode = req.headers.authorization?.split(' ');
        if (!authCode || authCode.length !== 2) {
            throw this.fastify.httpErrors.badRequest("Invalid authorization info.");
        }

        const userId = await this.userService.verifyJwtToken(authCode[1]);

        const user = await this.userService.getUser(userId);

        return {
            ...user,
            claims: user.claims.map(claim => ({
                ...claim,
                starts: claim.starts.toISOString(),
                ends: claim.starts.toISOString(),
            })),
            _id: user._id.toHexString(),
        };
    }
}