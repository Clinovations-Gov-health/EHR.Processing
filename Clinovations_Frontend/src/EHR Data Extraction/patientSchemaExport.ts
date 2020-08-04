//describes the shape of the patient data as exported to the backend

export interface patientEncounter { 
    participants: string[],
    period: { 
        end: string,
        start: string
    },
    type: { 
        coding: { 
            code: number, 
            display: string,
            system: string
        }[]
    }[], 
    class: { 
        code: string
    }
}


export interface patientProcedure { 
    period: { 
        end: string,
        start: string
    },
    coding: { 
        encoding: { 
            code: number,
            display: string,
            system: string
        }[]
    }, 
    EncounterContext: { 
        reference: string
    }
}

export interface patientMedication { 
    status: string,
    coding: { 
        encoding: { 
            code: number,
            display: string,
            system: string
        }[]
    }
}