import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardHomepageComponent } from './components/dashboard/dashboard-homepage/dashboard-homepage.component';
import { ErrorComponent } from './components/error/error.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { RegisterPageComponent } from './components/register-page/register-page.component';
import { DashboardGuard } from './guard/dashboard.guard';

const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    // { path: 'findPlan', component: PatientDataFormComponent, canActivate: [FindPlanPageRedirectGuard] },
    // { path: 'result', component: RecommendationComponent },
    { path: 'dashboard', component: DashboardHomepageComponent, canActivate: [DashboardGuard]},
    { path: 'register', component: RegisterPageComponent },
    { path: 'login', component: LoginPageComponent },
    { path: 'error', component: ErrorComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
