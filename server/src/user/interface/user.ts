import { ObjectId } from "mongodb";
import { Claim } from "./claims";
import { PlanRecommendation } from "./plan-recommendation";

export type UserModel = {
    _id: ObjectId,
    claims: Claim[],
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

