import { Component } from '@angular/core';
import { InsurancePlanService } from '../../../services/insurance-plan/insurance-plan.service';
import { UserService } from '../../../services/user/user.service';

const SortCriterions = ["Total Estimated Medical Cost", "Out Of Pocket Cost", "Deductible", "Monthly Premium", "Maximum Out Of Pocket"] as const;
type SortCriterion = typeof SortCriterions[number];

@Component({
    selector: 'app-dashboard-overview',
    templateUrl: './dashboard-overview.component.html',
    styleUrls: ['./dashboard-overview.component.scss']
})
export class DashboardOverviewComponent {
    showingPreDeductible: boolean = true;
    sortingCriterion: SortCriterion = "Total Estimated Medical Cost";
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
            case "Total Estimated Medical Cost":
                ids = plans.costSortIds;
                break;

            case "Deductible":
                ids = plans.deductibleSortIds;
                break;

            case "Maximum Out Of Pocket":
                ids = plans.maximumOOPSortIds;
                break;

            case "Out Of Pocket Cost":
                ids = plans.oopSortIds;
                break;

            case "Monthly Premium":
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
