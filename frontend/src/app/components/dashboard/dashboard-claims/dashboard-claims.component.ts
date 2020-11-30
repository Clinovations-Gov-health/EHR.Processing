import { Component, OnInit } from '@angular/core';
import { FhirProviders, FhirService } from '../../../services/fhir.service';
import { Claim } from '../../../services/user/interfaces/user.interface';
import { UserService } from '../../../services/user/user.service';

@Component({
  selector: 'app-dashboard-claims',
  templateUrl: './dashboard-claims.component.html',
  styleUrls: ['./dashboard-claims.component.scss']
})
export class DashboardClaimsComponent {
    working: boolean = false;

    constructor(
        readonly userService: UserService,
        readonly fhirService: FhirService,
    ) { }

    onConnect(fhirProvider: FhirProviders) {
        this.working = true;
        const claimsData: Claim[] = this.fhirService.getClaimsData(fhirProvider);
        
        this.userService.updateClaims(claimsData.map(claim => ({
            ...claim,
            starts: claim.starts.toDate().toISOString(),
            ends: claim.ends.toDate().toISOString()
        }))).then(_ => this.working = false);
    }

}
