import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from './services/user/user.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit { 
    constructor(
        private readonly cookieService: CookieService,
        private readonly userService: UserService,
    ) {}

    ngOnInit() {
        if (this.cookieService.check("token")) {
            this.userService.currToken.next(this.cookieService.get("token"));
        }
    }

}
