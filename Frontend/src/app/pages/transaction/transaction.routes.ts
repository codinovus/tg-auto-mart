import { Routes } from '@angular/router';
import { ListTransactionComponent } from './listtransaction/listtransaction.component';
import { CreateupdatetransactionComponent } from './createupdatetransaction/createupdatetransaction.component';

export const transactionRoutes: Routes = [
  {
    path: 'create',
    component: CreateupdatetransactionComponent,
  },
  {
    path: 'edit/:id',
    component: CreateupdatetransactionComponent,
  },
  {
    path: '',
    component: ListTransactionComponent,
  },
];
