import { Component } from '@angular/core';
import { InsurancePlanService } from '../../../services/insurance-plan/insurance-plan.service';
import { UserService } from '../../../services/user/user.service';

const SortCriterions = ["cost", "oop", "deductible", "premium", "maximum oop"] as const;
type SortCriterion = typeof SortCriterions[number];

@Component({
    selector: 'app-dashboard-overview',
    templateUrl: './dashboard-overview.component.html',
    styleUrls: ['./dashboard-overview.component.scss']
})
export class DashboardOverviewComponent {
    showingPreDeductible: boolean = true;
    sortingCriterion: SortCriterion = "cost";
    isWorking: boolean = false;

    readonly sortingCriterions = SortCriterions;

    constructor(
        readonly userService: UserService,
        readonly planService: InsurancePlanService,
    ) {}

    getPlans(criterion: SortCriterion) {
        let ids: string[];
        const plans = this.userService.currUser.getValue().lastRecommendPlans;
        switch (criterion) {
            case "cost":
                ids = plans.costSortIds;
                break;

            case "deductible":
                ids = plans.deductibleSortIds;
                break;

            case "maximum oop":
                ids = plans.maximumOOPSortIds;
                break;

            case "oop":
                ids = plans.oopSortIds;
                break;

            case "premium":
                ids = plans.premiumSortIds;
        }

        return ids.map(id => plans.plans[id]);
    }

    onGetNewRecommendations() {
        this.isWorking = true;
        this.planService.fetchPlanRecommendations()
            .then(_ => this.isWorking = false);
    }
}
