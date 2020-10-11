import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { FhirService } from '../services/fhir.service';

@Injectable({
    providedIn: 'root'
})
export class FindPlanPageRedirectGuard implements CanActivate {
    constructor(
        private readonly fhirService: FhirService,
        private readonly router: Router,
    ) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Promise<boolean> | boolean {
        if (route.queryParams.redirected) {
            return this.fhirService.initializeClient()
                .then(_ => true)
                .catch(_ => {
                    this.router.navigateByUrl("/error");
                    return false;
                });
        } else {
            return true;
        }
    } 
}