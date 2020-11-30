import { PlanRecommendation } from './user.interface';

/*************** Payload for createUser() ***********/
export type CreateUserPayload = {    
    market: "individual" | "small group";
    demographic: "child" | "adult";
    zipCode: string;
    username: string;
    password: string;
} & ({
    target: "individual";
    age: number;
    usesTobacco: boolean;
} | {
    target: "family";
    hasSpouse: boolean;
    numChildren: number;
});

export type CreateUserReturnPayload = {
    token: string;
}

/*************** Payload for login() ****************/
export type LoginPayload = {
    username: string;
    password: string;
}

export type LoginReturnPayload = {
    token: string;
}

/*************** Payload for getUser() ***************/
export type GetUserReturnPayload = {
    _id: string,
    claims: {
        starts: string;
        ends: string;
        diagnoses: { name: string; code: number; }[];
        totalCost: number;
    }[],
    lastRecommendPlans: PlanRecommendation | null,
    market: "individual" | "small group";
    demographic: "child" | "adult";
    zipCode: string;
    username: string;
    password: string;
} & ({
    target: "individual";
    age: number;
    usesTobacco: boolean;
} | {
    target: "family";
    hasSpouse: boolean;
    numChildren: number;
});

/***************** Payload for updateUser() *************/
export type UpdateUserPayload = {
    market: "individual" | "small group";
    demographic: "child" | "adult";
    zipCode: string;
} & ({
    target: "individual";
    age: number;
    usesTobacco: boolean;
} | {
    target: "family";
    hasSpouse: boolean;
    numChildren: number;
});

/***************** Payload for updateClaims() ***********/
export type updateClaimsPayload = {
    starts: string;
    ends: string;
    diagnoses: { name: string; code: number; }[];
    totalCost: number;
}[];