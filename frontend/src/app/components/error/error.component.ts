import { Component } from '@angular/core';

@Component({
    selector: 'app-error',
    template: `
        <p>You're trying to access a page in a bad state. Please try again. </p>
    `
})
export class ErrorComponent {}