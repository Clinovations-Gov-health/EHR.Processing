import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InsurancePlanService } from './services/insurance-plan/insurance-plan.service';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ErrorComponent } from './components/error/error.component';
import { DashboardOverviewComponent } from './components/dashboard/dashboard-overview/dashboard-overview.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { RegisterPageComponent } from './components/register-page/register-page.component';
import { DashboardHomepageComponent } from './components/dashboard/dashboard-homepage/dashboard-homepage.component';
import { DashboardProfileComponent } from './components/dashboard/dashboard-profile/dashboard-profile.component';
import { DashboardClaimsComponent } from './components/dashboard/dashboard-claims/dashboard-claims.component';
import { MatTableModule} from '@angular/material/table';

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
        InsurancePlanService,
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
