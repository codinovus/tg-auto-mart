import { Component } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-toast',
  template: `<p-toast position="top-right" [autoZIndex]="true" [baseZIndex]="10000"></p-toast>`,
  standalone: true,
  imports: [ToastModule],
  providers: [MessageService] // Provide MessageService
})
export class ToastComponent {
  constructor(private messageService: MessageService) {}

  showSuccess(message: string) {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
  }

  showError(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }
}
