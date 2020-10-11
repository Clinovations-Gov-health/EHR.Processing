import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlanRecommendationReturnPayload, PlanRecommendationPayload } from './insurance-plan.interface';
import { encode } from 'messagepack';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class InsurancePlanService {
    constructor(
        private readonly http: HttpClient,
    ) { }

    private readonly backendAddress = "http://localhost:4000";
    
    plans: BehaviorSubject<PlanRecommendationReturnPayload | null> = new BehaviorSubject(null);

    fetchPlanRecommendations(payload: PlanRecommendationPayload) {
        const encodedPayload: string = Array.prototype.map.call(encode(payload), (x: number) => ('00' + x.toString(16)).slice(-2)).join('');

        this.http.get<PlanRecommendationReturnPayload>(`${this.backendAddress}/plan/recommendation?data=${encodedPayload}`, { responseType: 'json' })
            .subscribe(res => this.plans.next(res));
    }
}
