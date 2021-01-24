import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { every, isNil } from 'lodash';
import { first, skipWhile } from 'rxjs/operators';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent {
    working: boolean = false;

    registerForm = new FormGroup({
        username: new FormControl("", [
            Validators.required,
        ]),
        password: new FormControl("", [
            Validators.required,
        ]),
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
                : { errorText: "Required to fill in age, tobacco, and zipcode" };
        } else if (control.get('target').value === 'family') {
            return control.get('numChildren').enabled && control.get('hasSpouse').enabled && every(control.controls, control => control.disabled || control.valid)
                ? null
                : { errorText: "Required to fill in number of children, spouse status, and zipcode." };
        } else {
            return { errorText: "Required to select a target." };
        }
    }});

    constructor(
        private readonly userService: UserService,
        private readonly router: Router,
    ) {
        this.registerForm.get('target').valueChanges.subscribe(change => {
            switch (change) {
                case 'individual':
                    this.registerForm.get('age').enable();
                    this.registerForm.get('usesTobacco').enable();
                    this.registerForm.get('numChildren').disable();
                    this.registerForm.get('hasSpouse').disable();
                    break;

                case 'family':
                    this.registerForm.get('age').disable();
                    this.registerForm.get('usesTobacco').disable();
                    this.registerForm.get('numChildren').enable();
                    this.registerForm.get('hasSpouse').enable();
            }
        });

    }

    onPressRegister() {
        this.working = true;
        this.userService.createUser({
            ...this.registerForm.value,
            demographic: "adult",
            market: "individual",
        });
        this.registerForm.disable();
        this.userService.currToken
            .pipe(skipWhile(isNil), first())
            .subscribe(_ => this.router.navigateByUrl('/overview'));
    }
}
