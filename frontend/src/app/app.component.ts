import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    template: `
    <div style="margin-top: 30px; margin-left: 50px"> 
        <router-outlet></router-outlet>
    </div>
    `,
})
export class AppComponent { }
