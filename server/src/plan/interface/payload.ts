/**
 * Shape of the parameters of the route `plan/recoomendation`.
 */
export interface RecommendationRequestParams {
    data: string;
}

/**
 * The EHR Data payload provided in the `data` parameter of the request.
 */
export type RecommendationEHRData = number | string;
/*
export type RecommendationEHRData = {
    market: "individual" | "smallGroup";
    demographic: "child" | "adult";
    target: "individual" | "family";
    stateCode: string;
} & ({
    target: "individual";
    age: number;
    usesTobacco: boolean;
} | {
    target: "family";
    hasSpouse: boolean;
    numChildren: number;
}) */