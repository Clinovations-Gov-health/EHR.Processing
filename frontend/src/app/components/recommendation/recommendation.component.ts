import { Component, OnInit } from '@angular/core';
import { PlanRecommendationReturnPayload } from '../../services/insurance-plan/insurance-plan.interface';
import { InsurancePlanService } from '../../services/insurance-plan/insurance-plan.service';

const SortCriterions = ["cost", "oop", "deductible", "premium", "maximum oop"] as const;
type SortCriterion = typeof SortCriterions[number];

@Component({
    selector: 'app-recommendation',
    templateUrl: './recommendation.component.html',
    styleUrls: ['./recommendation.component.scss']
})
export class RecommendationComponent {
    showingPreDeductible: boolean = true;
    sortingCriterion: SortCriterion = "cost";

    readonly sortingCriterions = SortCriterions;

    constructor(
        readonly insurancePlanService: InsurancePlanService,
    ) {}

    getPlans(criterion: SortCriterion) {
        let ids: string[];
        const plans = this.insurancePlanService.plans.getValue();
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
}
