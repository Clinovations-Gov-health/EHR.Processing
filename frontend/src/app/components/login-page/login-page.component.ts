import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { every, isNil } from 'lodash';
import { UserService } from '../../services/user/user.service';
import { first, skipWhile } from 'rxjs/operators';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {
    loginForm = new FormGroup({
        username: new FormControl("", [
            Validators.required,
        ]),
        password: new FormControl("", [
            Validators.required,
        ]),
    }, { validators: (control: FormGroup) => {
        if (!every(control.controls, control => control.disabled || control.valid)) {
            return { errorText: "Missing fields." };
        } else {
            return null;
        }
    }});

    working: boolean = false;

    constructor(
        private readonly userService: UserService,
        private readonly router: Router,
    ) { }

    onPressLogin() {
        this.working = true;
        this.userService.login(this.loginForm.value);
        this.userService.currToken
            .pipe(skipWhile(isNil), first())
            .subscribe(_ => this.router.navigateByUrl('/overview'));
    }

    onPressRegister() {
        this.router.navigateByUrl('/register');
    }
}
