import { Routes } from '@angular/router';
import { CreateupdatecryptowalletComponent } from './createupdatecryptowallet/createupdatecryptowallet.component';
import { ListCryptowalletComponent } from './listcryptowallet/listcryptowallet.component';


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
    path: '',
    component: ListCryptowalletComponent,
  },
];
