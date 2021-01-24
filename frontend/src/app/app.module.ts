import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CookieService } from 'ngx-cookie-service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardClaimsComponent } from './components/dashboard/dashboard-claims/dashboard-claims.component';
import { DashboardHomepageComponent } from './components/dashboard/dashboard-homepage/dashboard-homepage.component';
import { DashboardOverviewComponent } from './components/dashboard/dashboard-overview/dashboard-overview.component';
import { DashboardProfileComponent } from './components/dashboard/dashboard-profile/dashboard-profile.component';
import { ErrorComponent } from './components/error/error.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { RegisterPageComponent } from './components/register-page/register-page.component';
import { FhirService } from './services/fhir.service';
import { InsurancePlanService } from './services/insurance-plan/insurance-plan.service';
import { UserService } from './services/user/user.service';

@NgModule({
    declarations: [
        AppComponent,
        ErrorComponent,
        DashboardOverviewComponent,
        LoginPageComponent,
        RegisterPageComponent,
        DashboardHomepageComponent,
        DashboardProfileComponent,
        DashboardClaimsComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,

        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatExpansionModule,
        MatDividerModule,
        MatSlideToggleModule,
        MatProgressSpinnerModule,
        MatToolbarModule,
        MatIconModule,
        MatTableModule,
    ],
    providers: [
        CookieService,
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
