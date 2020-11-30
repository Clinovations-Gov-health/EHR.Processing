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

export interface LoginPayload {
    username: string;
    password: string;
}

export type UpdatePayload = {
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

export type UpdateClaimsPayload = {
    starts: string;
    ends: string;
    diagnoses: { name: string; code: number; }[];
    totalCost: number;
}[];