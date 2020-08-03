//Defines interfaces for types of patient data extracted from the EHR

export interface patientEncounter { 
    id: string,
    participants: { 
        invdividual: { 
            reference: string
        }
    }[],
    period: { 
        end: string,
        start: string
    },
    type: { 
        coding: { 
            code: number, 
            display: string,
            system: string
        }[],
        text: string
    }[], 
    class: { 
        code: string
    }
}


export interface patientProcedure { 
    id: string,
    period: { 
        end: string,
        start: string
    },
    coding: { 
        encoding: { 
            code: number,
            display: string,
            system: string
        }[],
        text: string
    }, 
    EncounterContext: { 
        reference: string
    }
}

export interface patientMedication { 
    id: string, 
    status: string,
    coding: { 
        encoding: { 
            code: number,
            display: string,
            system: string
        }[],
        text: string
    }
}