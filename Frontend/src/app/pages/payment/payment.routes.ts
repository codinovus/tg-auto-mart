import { Routes } from '@angular/router';
import { CreateUpdatePaymentComponent } from './createupdatepayment/createupdatepayment.component';
import { ListPaymentComponent } from './listpayment/listpayment.component';

export const paymentRoutes: Routes = [
  {
    path: 'create',
    component: CreateUpdatePaymentComponent,
  },
  {
    path: 'edit/:id',
    component: CreateUpdatePaymentComponent,
  },
  {
    path: '',
    component: ListPaymentComponent
  }
];
