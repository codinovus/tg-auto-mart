import { Injectable } from '@angular/core';
import { MessageService as PrimeNGMessageService } from 'primeng/api';

export enum MessageSeverity {
  SUCCESS = 'success',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private primeNGMessageService: PrimeNGMessageService) {}

  /**
   * Show a success message
   * @param summary Summary text (title)
   * @param detail Detailed message text
   * @param sticky Whether the toast should remain until closed
   */
  showSuccess(summary: string, detail?: string, sticky?: boolean): void {
    this.showMessage(MessageSeverity.SUCCESS, summary, detail, sticky);
  }

  /**
   * Show an information message
   * @param summary Summary text (title)
   * @param detail Detailed message text
   * @param sticky Whether the toast should remain until closed
   */
  showInfo(summary: string, detail?: string, sticky?: boolean): void {
    this.showMessage(MessageSeverity.INFO, summary, detail, sticky);
  }

  /**
   * Show a warning message
   * @param summary Summary text (title)
   * @param detail Detailed message text
   * @param sticky Whether the toast should remain until closed
   */
  showWarning(summary: string, detail?: string, sticky?: boolean): void {
    this.showMessage(MessageSeverity.WARN, summary, detail, sticky);
  }

  /**
   * Show an error message
   * @param summary Summary text (title)
   * @param detail Detailed message text
   * @param sticky Whether the toast should remain until closed
   */
  showError(summary: string, detail?: string, sticky?: boolean): void {
    this.showMessage(MessageSeverity.ERROR, summary, detail, sticky);
  }

  /**
   * Show an error message from an HTTP error
   * @param error Error object from HTTP request
   * @param defaultMessage Default message to show if no message found in error
   */
  showHttpError(error: any, defaultMessage: string = 'An error occurred'): void {
    let message = defaultMessage;

    if (error) {
      if (error.error?.message) {
        message = error.error.message;
      } else if (error.message) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }
    }

    this.showError('Error', message, true);
  }

  /**
   * Clear all toast messages
   */
  clearAll(): void {
    this.primeNGMessageService.clear();
  }

  private showMessage(severity: MessageSeverity, summary: string, detail?: string, sticky: boolean = false): void {
    this.primeNGMessageService.add({
      severity: severity,
      summary: summary,
      detail: detail || '',
      life: sticky ? 0 : 5000 // 0 means it stays until closed
    });
  }
}
