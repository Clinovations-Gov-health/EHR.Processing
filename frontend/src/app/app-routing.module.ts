import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PatientDataFormComponent } from './components/patient-data-form/patient-data-form.component';

const routes: Routes = [
    { path: '', redirectTo: 'findPlan', pathMatch: 'full' },
    { path: 'findPlan', component: PatientDataFormComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
