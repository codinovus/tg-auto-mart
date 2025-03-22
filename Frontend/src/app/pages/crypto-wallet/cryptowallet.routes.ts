import { Routes } from '@angular/router';
import { CreateupdatecryptowalletComponent } from './createupdatecryptowallet/createupdatecryptowallet.component';
import { ListcryptowalletComponent } from './listcryptowallet/listcryptowallet.component';

export const cryptowalletRoutes: Routes = [
  {
    path: 'create',
    component: CreateupdatecryptowalletComponent,
  },
  {
    path: 'edit/:id',
    component: CreateupdatecryptowalletComponent,
  },
  {
    path: 'list',
    component: ListcryptowalletComponent,
  },
];
