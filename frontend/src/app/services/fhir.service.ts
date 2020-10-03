import { Injectable } from '@angular/core';
import FHIR from 'fhirclient';
import Client from 'fhirclient/lib/Client';
import { parseIsolatedEntityName } from 'typescript';
import { R4 } from '@ahryman40k/ts-fhir-types';
import { IPatient } from '@ahryman40k/ts-fhir-types/lib/R4';

@Injectable({
    providedIn: 'root'
})
export class FhirService {
    client: Client;
    authenticated = false;

    constructor() {
        console.log("LOL");
    }

    // Called when one wants to redirect the user to Cerner to login.
    authenticate() {
        FHIR.oauth2.authorize({
            iss: "https://fhir-myrecord.cerner.com/dstu2/ec2458f2-1e24-41c8-b71b-0e701af7583d",
            scope: "patient/Patient.read patient/Observation.read launch/patient",
            clientId: "7903d5f0-a216-4795-9abc-8bf5f0b3cd17",
            redirectUri: "http://localhost:4200/findPlan?redirected=true",
        });
    }

    // Called when the user has logged in through OAuth2.0.
    async initializeClient() {
        this.client = await FHIR.oauth2.ready();
        this.authenticated = true;
    }

    async getPatient() {
        console.log(this.client);
        const request = await this.client.patient.request("Patient") as R4.IBundle;
        const patient = request.entry[0].resource as IPatient;
        console.log(patient);
        return patient;
    }
}
