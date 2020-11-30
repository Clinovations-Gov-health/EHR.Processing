import { PlanRecommendation } from "./plan-recommendation";

export interface CreateUserReturnPayload {
    token: string;
}

export interface LoginReturnPayload {
    token: string;
}

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
