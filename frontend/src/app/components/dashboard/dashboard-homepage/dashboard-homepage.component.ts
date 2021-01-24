import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user/user.service';

@Component({
    selector: 'app-dashboard-homepage',
    templateUrl: './dashboard-homepage.component.html',
    styleUrls: ['./dashboard-homepage.component.scss']
})
export class DashboardHomepageComponent {
    currPage: "overview" | "claims" | "profile" = "overview";

    constructor(
        route: ActivatedRoute,
        readonly userService: UserService,
        readonly router: Router,
    ) {
        this.currPage = route.snapshot.url[0].path as "overview" | "claims" | "profile";
    }

    logout() {
        this.userService.logout();
        this.router.navigateByUrl("login");
    }
}
