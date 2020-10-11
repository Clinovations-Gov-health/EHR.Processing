import { R4 } from '@ahryman40k/ts-fhir-types';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { every } from 'lodash';
import { FhirProviders, FhirService } from '../../services/fhir.service';
import { InsurancePlanService } from '../../services/insurance-plan/insurance-plan.service';

@Component({
    selector: 'app-patient-data-form',
    templateUrl: './patient-data-form.component.html',
    styleUrls: ['./patient-data-form.component.scss']
})
export class PatientDataFormComponent {
    patient: Promise<R4.IPatient>;

    patientDataForm = new FormGroup({
        zipCode: new FormControl("", [
            Validators.required,
            Validators.pattern(/^[\d]{5}$/g),
        ]),
        target: new FormControl("", [
            Validators.required,
            Validators.pattern(/individual|family/),
        ]),
        age: new FormControl("", [
            control => typeof control.value === "number" && control.value >= 0
                ? null
                : { age: "Must be a nonnegative integer" },
        ]),
        usesTobacco: new FormControl("", [
            control => typeof control.value === "boolean"
                ? null
                : { usesTobacco: { value: "Invalid value." }},
        ]),
        hasSpouse: new FormControl("", [
            control => typeof control.value === "boolean"
                ? null
                : { hasSpouse: "Invalid value." },
        ]),
        numChildren: new FormControl("", [
            control => typeof control.value === "number" && control.value >= 0
                ? null
                : { numChildren: "Must be a nonnegative integer." },
        ]),
    }, { validators: (control: FormGroup) => {
        if (!this.fhirService.authenticated) {
            return { errorText: "Haven't connected with Fhir service." };
        }

        if (control.get('target').value === 'individual') {
            every(control.controls, control => control.valid);
            return control.get('usesTobacco').enabled && control.get('age').enabled && every(control.controls, control => control.disabled || control.valid)
                ? null
                : { errorText: "Required to fill in age and usesTobacco." };
        } else if (control.get('target').value === 'family') {
            return control.get('numChildren').enabled && control.get('hasSpouse').enabled && every(control.controls, control => control.disabled || control.valid)
                ? null
                : { errorText: "Required to fill in age and usesTobacco." };
        } else {
            return { errorText: "Required to select a target." };
        }
    }});

    constructor(
        private readonly insurancePlanService: InsurancePlanService, 
        readonly fhirService: FhirService,
        route: ActivatedRoute,
        private readonly router: Router,
    ) {
        this.patientDataForm.get('target').valueChanges.subscribe(change => {
            switch (change) {
                case 'individual':
                    this.patientDataForm.get('age').enable();
                    this.patientDataForm.get('usesTobacco').enable();
                    this.patientDataForm.get('numChildren').disable();
                    this.patientDataForm.get('hasSpouse').disable();
                    break;

                case 'family':
                    this.patientDataForm.get('age').disable();
                    this.patientDataForm.get('usesTobacco').disable();
                    this.patientDataForm.get('numChildren').enable();
                    this.patientDataForm.get('hasSpouse').enable();
            }
        });

        if (route.snapshot.queryParams.redirected) {
            this.patient = this.fhirService.getPatient();
        }
    }

    connectWithFhir(provider: FhirProviders) {
        this.fhirService.authenticate(provider);
    }

    async onSubmit() {
        const rawPayload = this.patientDataForm.value;
        this.patientDataForm.disable();
        const payload = {
            ...rawPayload,
            demographic: "adult",
            market: "individual",
            encounters: [
                { 
                    participants: [],
                    period: { end: "2019-10-02T11:32:43-04:00", start: "2019-10-02T11:02:43-04:00" },
                    type: [ { coding: [ { code: "185345009", display: "Encounter for symptom", system: "cpt" } ] } ],
                    class: { code: "WELLNESS" },
                },
                {
                    participants: [],
                    period: { end: "2019-10-02T11:32:43-04:00", start: "2019-10-02T11:02:43-04:00" },
                    type: [ { coding: [ { code: "185349003", display: "Encounter for checkup", system: "cpt" } ] } ],
                    class: { code: "WELLNESS" },
                },
                {
                    participants: [],
                    period: { end: "2019-10-02T11:32:43-04:00", start: "2019-10-02T11:02:43-04:00" },
                    type: [ { coding: [ { code: "50849002", display: "Emergency room admission", system: "cpt" } ] } ],
                    class: { code: "WELLNESS" },
                },
                {
                    participants: [],
                    period: { end: "2019-10-02T11:32:43-04:00", start: "2019-10-02T11:02:43-04:00" },
                    type: [ { coding: [ { code: "185349003", display: "Encounter for checkup", system: "cpt" } ] } ],
                    class: { code: "WELLNESS" },
                }
            ],
            procedures: [
                {
                    period: { end: "2019-10-02T11:32:43-04:00", start: "2019-10-02T11:02:43-04:00" },
                    coding: { encoding: [{ code: "1225002", display: "Upper arm X-Ray", system: "cpt" }] },
                    encounterContext: { reference: "reference" },
                }
            ]
        }

        this.insurancePlanService.fetchPlanRecommendations(payload);
        this.router.navigateByUrl("/result");
    }
}
