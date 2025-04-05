import { Component } from '@angular/core';

@Component({
    selector: 'app-disclaimer',
    template: `
        <div class="disclaimer">
            <h2>Disclaimer</h2>
            <p>
                The developer is not responsible for how this code will be used or implemented.
                This code is intended for educational and personal use only and is not for commercial use.
                By using this code, you agree to take full responsibility for any consequences that may arise from its use.
            </p>
        </div>
    `,
    styles: [`
        .disclaimer {
            padding: 1rem;
            background-color: #f9f9f9;
            border: 1px solid #ccc;
            border-radius: 5px;
            margin-top: 1rem;
        }
    `]
})
export class Disclaimer {}
