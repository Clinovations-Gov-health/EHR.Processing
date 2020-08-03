/**
 * Shape of the parameters of the route `plan/recoomendation`.
 */
export interface RecommendationRequestQuery {
    data: RecommendationEHRData;
}

/**
 * The EHR Data payload provided in the `data` parameter of the request.
 */
export type RecommendationEHRData = {
    market: "individual" | "smallGroup";
    demographic: "child" | "adult";
    target: "individual" | "family";
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