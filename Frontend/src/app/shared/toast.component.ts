import { Component } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-toast',
  template: `<p-toast position="top-right" [autoZIndex]="true" [baseZIndex]="10000"></p-toast>`,
  standalone: true,
  imports: [ToastModule]
})
export class ToastComponent {}
