//Defines interfaces for types of patient data extracted from the EHR

export interface patientEncounterIn { 
    id: string
    //condense into array of strings
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


export interface patientProcedureIn { 
    id: string
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

export interface patientMedicationIn { 
    id: string
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