import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardHomepageComponent } from './components/dashboard/dashboard-homepage/dashboard-homepage.component';
import { ErrorComponent } from './components/error/error.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { RegisterPageComponent } from './components/register-page/register-page.component';
import { LoginGuard } from './guard/login.guard';

const routes: Routes = [
    { path: '', redirectTo: 'overview', pathMatch: 'full' },
    // { path: 'findPlan', component: PatientDataFormComponent, canActivate: [FindPlanPageRedirectGuard] },
    // { path: 'result', component: RecommendationComponent },
    { path: 'overview', component: DashboardHomepageComponent, canActivate: [LoginGuard]},
    { path: 'claims', component: DashboardHomepageComponent, canActivate: [LoginGuard]},
    { path: 'profile', component: DashboardHomepageComponent, canActivate: [LoginGuard]},
    { path: 'register', component: RegisterPageComponent },
    { path: 'login', component: LoginPageComponent },
    { path: 'error', component: ErrorComponent },
    { path: '**', component: ErrorComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
