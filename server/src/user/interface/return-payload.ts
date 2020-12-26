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
        procCode: string;
        typeOfService: string;
        amountBilled: number;
        planPaid: number;
        responsibility: number;
    }[],
    lastRecommendPlans: PlanRecommendation | null,
    currPlanMonthlyPremium: number;
    currPlanAnnualDeductible: number;
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
