import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from '../user/user.service';
import { PlanRecommendationReturnPayload } from './insurance-plan.interface';

@Injectable({
    providedIn: 'root'
})
export class InsurancePlanService {
    constructor(
        private readonly http: HttpClient,
        private readonly userService: UserService
    ) { }

    private readonly backendAddress = "http://localhost:4000";

    fetchPlanRecommendations() {
        return new Promise<void>(resolve => {
            this.http.get<PlanRecommendationReturnPayload>(`${this.backendAddress}/plan/recommendation`, { responseType: 'json', headers: { Authorization: `bearer ${this.userService.currToken.getValue()}` } })
                .subscribe(res => {
                    const currUser = this.userService.currUser.getValue();
                    this.userService.currUser.next({
                        ...currUser,
                        lastRecommendPlans: res,
                    });
                    resolve();
                });
        })
    }
}
