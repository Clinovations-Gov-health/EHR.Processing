import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlanRecommendationReturnPayload, PlanRecommendationPayload } from './insurance-plan.interface';
import { encode } from 'messagepack';

@Injectable({
    providedIn: 'root'
})
export class InsurancePlanService {
    constructor(
        private readonly http: HttpClient,
    ) { }

    private readonly backendAddress = "http://localhost:4000";

    getPlanRecommendations(payload: PlanRecommendationPayload): Promise<PlanRecommendationReturnPayload> {
        const encodedPayload: string = Array.prototype.map.call(encode(payload), (x: number) => ('00' + x.toString(16)).slice(-2)).join('');
        return this.http.get<PlanRecommendationReturnPayload>(`${this.backendAddress}/plan/recommendation?data=${encodedPayload}`, { responseType: 'json' }).toPromise();
    }
}
