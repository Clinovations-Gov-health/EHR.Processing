import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { every, isNil, pick } from 'lodash';
import { filter } from 'rxjs/operators';
import { UserService } from '../../../services/user/user.service';

@Component({
    selector: 'app-dashboard-profile',
    templateUrl: './dashboard-profile.component.html',
    styleUrls: ['./dashboard-profile.component.scss']
})
export class DashboardProfileComponent {
    working: boolean = false;

    profileForm = new FormGroup({
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
        currPlanMonthlyPremium: new FormControl("", [
            control => typeof control.value === "number" && control.value >= 0
                ? null
                : { currPlanMonthlyPremium: "Must be a nonnegative number." },
        ]),
        currPlanAnnualDeductible: new FormControl("", [
            control => typeof control.value === "number" && control.value >= 0
                ? null
                : { currPlanAnnualDeductible: "Must be a nonnegative number." },
        ]),
    }, { validators: (control: FormGroup) => {
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
        readonly userService: UserService,
    ) { 
        this.profileForm.get('target').valueChanges.subscribe(change => {
            switch (change) {
                case 'individual':
                    this.profileForm.get('age').enable();
                    this.profileForm.get('usesTobacco').enable();
                    this.profileForm.get('numChildren').disable();
                    this.profileForm.get('hasSpouse').disable();
                    break;

                case 'family':
                    this.profileForm.get('age').disable();
                    this.profileForm.get('usesTobacco').disable();
                    this.profileForm.get('numChildren').enable();
                    this.profileForm.get('hasSpouse').enable();
            }
        });

        userService.currUser.pipe(filter(user => !isNil(user)))
            .subscribe(currUser => {
                if (currUser.target === "individual") {
                    this.profileForm.setValue({
                        ...pick(
                            currUser,
                            "zipCode", "target", "age", "usesTobacco", "currPlanMonthlyPremium", "currPlanAnnualDeductible"
                        ),
                        hasSpouse: false,
                        numChildren: 0,
                    });
                } else {
                    this.profileForm.setValue({
                        ...pick(
                            currUser,
                            "zipCode", "target", "hasSpouse", "numChildren", "currPlanMonthlyPremium", "currPlanAnnualDeductible"
                        ),
                        usesTobacco: false,
                        age: 0,
                    });
                }
            });
    }

    onSubmitChanges() {
        this.working = true;
        this.userService.updateUser({
            ...this.profileForm.value,
            demographic: "adult",
            market: "individual",
        }).then(() => this.working = false);
    }

}
