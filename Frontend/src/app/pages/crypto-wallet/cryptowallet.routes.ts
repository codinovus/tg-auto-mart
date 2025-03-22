import { Routes } from '@angular/router';
import { CreateupdatecryptowalletComponent } from './createupdatecryptowallet/createupdatecryptowallet.component';

export const cryptowalletRoutes: Routes = [
  {
    path: 'create',
    component: CreateupdatecryptowalletComponent,
  },
  {
    path: 'edit/:id',
    component: CreateupdatecryptowalletComponent,
  },
];
