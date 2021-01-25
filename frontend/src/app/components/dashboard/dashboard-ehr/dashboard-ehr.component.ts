import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FhirProviders, FhirService } from '../../../services/fhir.service';

import moment from 'moment';

@Component({
    selector: 'app-dashboard-ehr',
    templateUrl: './dashboard-ehr.component.html',
    styleUrls: ['./dashboard-ehr.component.scss']
})
export class DashboardEhrComponent {
    working = false;

    moment = moment;

    constructor(
        readonly fhirService: FhirService,
        route: ActivatedRoute,
    ) { 
        if (route.snapshot.queryParamMap.has("redirected")) {
            fhirService.initializeClient();
        }
    }

    connectWithFhir(provider: FhirProviders) {
        this.working = true;
        this.fhirService.authenticate(provider);
    }
    
}
