import { Routes } from '@angular/router';
import { CreateupdatewalletComponent } from './createupdatewallet/createupdatewallet.component';

export const walletRoutes: Routes = [
  {
    path: 'create',
    component: CreateupdatewalletComponent,
  },
  {
    path: 'edit/:id',
    component: CreateupdatewalletComponent,
  },
];
