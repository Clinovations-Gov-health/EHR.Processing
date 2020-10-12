import { R4 } from '@ahryman40k/ts-fhir-types';
import { IPatient } from '@ahryman40k/ts-fhir-types/lib/R4';
import { Injectable } from '@angular/core';
import FHIR from 'fhirclient';
import Client from 'fhirclient/lib/Client';

export type FhirProviders = "Cerner" | "AllScripts" | "Epic";

@Injectable({
    providedIn: 'root'
})
export class FhirService {
    client: Client;
    authenticated = false;

    // Called when one wants to redirect the user to Cerner to login.
    authenticate(provider: FhirProviders) {
        switch (provider) {
            case "Cerner":
                FHIR.oauth2.authorize({
                    iss: "https://fhir-myrecord.cerner.com/dstu2/ec2458f2-1e24-41c8-b71b-0e701af7583d",
                    scope: "patient/Patient.read patient/Observation.read launch/patient",
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
                    iss: "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/DSTU2",
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
        const request = await this.client.patient.request("Patient") as R4.IBundle;
        const patient = request.entry[0].resource as IPatient;
        return patient;
    }
}
