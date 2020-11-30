import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user/user.service';

@Component({
  selector: 'app-dashboard-homepage',
  templateUrl: './dashboard-homepage.component.html',
  styleUrls: ['./dashboard-homepage.component.scss']
})
export class DashboardHomepageComponent {
    currPage: "overview" | "claims" | "profile" = "overview";

    constructor(
        readonly userService: UserService,
    ) { }
}
