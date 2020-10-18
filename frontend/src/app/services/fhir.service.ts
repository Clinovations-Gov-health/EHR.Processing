import { R4 } from '@ahryman40k/ts-fhir-types';
import { IPatient } from '@ahryman40k/ts-fhir-types/lib/R4';
import { Injectable } from '@angular/core';
import FHIR from 'fhirclient';
import Client from 'fhirclient/lib/Client';
import { BehaviorSubject } from 'rxjs';

export type FhirProviders = "Cerner" | "AllScripts" | "Epic";

@Injectable({
    providedIn: 'root'
})
export class FhirService {
    client: Client;
    authenticated = false;

    patientObservable: BehaviorSubject<R4.IPatient | null> = new BehaviorSubject(null);
    encountersObservable: BehaviorSubject<R4.IEncounter[] | null> = new BehaviorSubject(null);

    // Called when one wants to redirect the user to Cerner to login.
    authenticate(provider: FhirProviders) {
        switch (provider) {
            case "Cerner":
                FHIR.oauth2.authorize({
                    iss: "https://fhir-myrecord.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d",
                    scope: "patient/Patient.read patient/Encounter.read patient/Procedure.read launch/patient",
                    clientId: "7903d5f0-a216-4795-9abc-8bf5f0b3cd17",
                    redirectUri: "http://localhost:4200/findPlan?redirected=true",
                });
                break;

            case "AllScripts":
                FHIR.oauth2.authorize({
                    iss: "https://applescm184region.open.allscripts.com/open",
                    scope: "patient/Patient.read patient/Observation.read launch/patient",
                    clientId: "da8dda9a-10c5-4c1e-9b9c-666d72f341a6",
                    redirectUri: "http://localhost:4200/findPlan?redirected=true",
                });
                break;

            case "Epic":
                FHIR.oauth2.authorize({
                    iss: "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
                    scope: "patient/Patient.read patient/Observation.read launch/patient",
                    clientId: "cfc9a653-503b-4c86-ae77-c67c343a6142",
                    redirectUri: "http://localhost:4200/findPlan?redirected=true",
                });
                break;
        }
    }

    // Called when the user has logged in through OAuth2.0.
    async initializeClient() {
        this.client = await FHIR.oauth2.ready();
        this.authenticated = true;
    }

    async getPatient() {
        const patient = await this.client.patient.read();

        this.patientObservable.next(patient);
        const encountersBundle: R4.IBundle = await this.client.request(`Encounter?patient=${this.patientObservable.value.id}`);
        const encounters = encountersBundle.entry.filter(entry => entry.resource.resourceType === "Encounter").map(entry => entry.resource) as R4.IEncounter[];
        this.encountersObservable.next(encounters);
        console.log(this.encountersObservable.value);
    }
}
