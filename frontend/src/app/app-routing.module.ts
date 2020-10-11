import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ErrorComponent } from './components/error/error.component';
import { PatientDataFormComponent } from './components/patient-data-form/patient-data-form.component';
import { RecommendationComponent } from './components/recommendation/recommendation.component';
import { FindPlanPageRedirectGuard } from './guards/find-plan-page-redirect.guard';

const routes: Routes = [
    { path: '', redirectTo: 'findPlan', pathMatch: 'full' },
    { path: 'findPlan', component: PatientDataFormComponent, canActivate: [FindPlanPageRedirectGuard] },
    { path: 'result', component: RecommendationComponent },
    { path: 'error', component: ErrorComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
