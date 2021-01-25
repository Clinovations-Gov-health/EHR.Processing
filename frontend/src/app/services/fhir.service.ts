import { R4 } from '@ahryman40k/ts-fhir-types';
import { IPatient } from '@ahryman40k/ts-fhir-types/lib/R4';
import { Injectable } from '@angular/core';
import FHIR from 'fhirclient';
import Client from 'fhirclient/lib/Client';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { Claim } from './user/interfaces/user.interface';
import { UserService } from './user/user.service';

export type FhirProviders = "Cerner" | "AllScripts" | "Epic";

@Injectable({
    providedIn: 'root'
})
export class FhirService {
    constructor(
        private readonly userService: UserService
    ) {}

    client: Client;
    authenticated: BehaviorSubject<boolean> = new BehaviorSubject(false);

    readonly claimsData: Claim[] = [
        { starts: moment('2020-01-18'), ends: moment('2020-01-18'), typeOfService: "Urine culture/colony count", procCode: "87086", amountBilled: 37.01, planPaid: 21.22, responsibility: 15.79 },
        { starts: moment('2020-01-18'), ends: moment('2020-01-18'), typeOfService: "Microbe susceptible mic", procCode: "87186", amountBilled: 84.00, planPaid: 69.45, responsibility: 14.55 },
        { starts: moment('2020-01-18'), ends: moment('2020-01-18'), typeOfService: "Urine bacteria culture", procCode: "87088", amountBilled: 34.99, planPaid: 21.37, responsibility: 13.62 },
        { starts: moment('2020-01-29'), ends: moment('2020-01-29'), typeOfService: "Immunization", procCode: "", amountBilled: 21.00, planPaid: 16.80, responsibility: 4.20 },
        { starts: moment('2020-01-29'), ends: moment('2020-01-29'), typeOfService: "Immunization", procCode: "", amountBilled: 32.00, planPaid: 32.00, responsibility: 0 },
        { starts: moment('2020-09-29'), ends: moment('2020-09-29'), typeOfService: "Office Outpatient visit 24 min", procCode: "99214 25", amountBilled: 202.84, planPaid: 0, responsibility: 0 },
        { starts: moment('2020-09-29'), ends: moment('2020-09-29'), typeOfService: "Therapeutic Prophylatic/Dx Injection SUBQ/IM", procCode: "96372", amountBilled: 46.56, planPaid: 0, responsibility: 0 },
        { starts: moment('2020-09-29'), ends: moment('2020-09-29'), typeOfService: "Injection Dexamethosone sodium phosphate 1MG", procCode: "J1100", amountBilled: 12.80, planPaid: 0, responsibility: 0 },
        { starts: moment('2020-11-21'), ends: moment('2020-11-21'), typeOfService: "Mammography", procCode: "", amountBilled: 51.50, planPaid: 12.87, responsibility: 38.63 },
        { starts: moment('2020-11-21'), ends: moment('2020-11-21'), typeOfService: "Screening Mammogram", procCode: "", amountBilled: 385.12, planPaid: 91.20, responsibility: 273.84 },
    ];

    getClaimsData(provider: FhirProviders) {
        return this.claimsData;
    }

    encountersObservable: BehaviorSubject<R4.IEncounter[] | null> = new BehaviorSubject(null);

    // Called when one wants to redirect the user to a provider to login.
    authenticate(provider: FhirProviders) {
        this.authenticated.next(false);
        this.encountersObservable.next(null);

        const redirectUri = `http://localhost:4200/ehr?redirected=true`;

        switch (provider) {
            case "Cerner":
                FHIR.oauth2.authorize({
                    iss: "https://fhir-myrecord.cerner.com/dstu2/ec2458f2-1e24-41c8-b71b-0e701af7583d",
                    scope: "patient/Patient.read patient/Encounter.read patient/Procedure.read launch/patient",
                    clientId: "7903d5f0-a216-4795-9abc-8bf5f0b3cd17",
                    redirectUri,
                    //redirectUri: "http://localhost:4200/findPlan?redirected=true",
                });
                break;

            case "AllScripts":
                FHIR.oauth2.authorize({
                    iss: "https://applescm184region.open.allscripts.com/open",
                    scope: "patient/Patient.read patient/Observation.read patient/AllergyIntolerance.read patient/Encounter.read launch/patient",
                    clientId: "da8dda9a-10c5-4c1e-9b9c-666d72f341a6",
                    redirectUri,
                    // redirectUri: "http://localhost:4200/findPlan?redirected=true",
                });
                break;

            case "Epic":
                FHIR.oauth2.authorize({
                    iss: "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
                    scope: "patient/Patient.read patient/Observation.read patient/MedicationRequest.search launch/patient",
                    clientId: "cfc9a653-503b-4c86-ae77-c67c343a6142",
                    redirectUri,
                    // redirectUri: "http://localhost:4200/findPlan?redirected=true",
                });
                break;
        }
    }

    // Called when the user has logged in through OAuth2.0.
    async initializeClient() {
        this.client = await FHIR.oauth2.ready();
        this.authenticated.next(true);

        const patient = await this.client.patient.read();
        const encountersBundle: R4.IBundle = await this.client.request(`Encounter?patient=${patient.id}`);
        const encounters = encountersBundle.entry.filter(entry => entry.resource.resourceType === "Encounter").map(entry => entry.resource) as R4.IEncounter[];

        console.log(encounters);

        this.encountersObservable.next(encounters);
    }
}
