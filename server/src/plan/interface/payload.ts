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
    market: "individual" | "small group";
    demographic: "child" | "adult";
    target: "individual" | "family";
    zipCode: string;
    encounters: PatientEncounter[],
    procedures: PatientProcedure[],
} & ({
    target: "individual";
    age: number;
    usesTobacco: boolean;
} | {
    target: "family";
    hasSpouse: boolean;
    numChildren: number;
});

export interface PatientEncounter { 
    participants: string[],
    period: { 
        end: string,
        start: string
    },
    type: { 
        coding: { 
            code: string, 
            display: string,
            system: "snomed" | "cpt",
        }[]
    }[], 
    class: { 
        code: string
    }
}


export interface PatientProcedure { 
    period: { 
        end: string,
        start: string
    },
    coding: { 
        encoding: { 
            code: string,
            display: string,
            system: "snomed" | "cpt",
        }[]
    }, 
    encounterContext: { 
        reference: string
    }
}