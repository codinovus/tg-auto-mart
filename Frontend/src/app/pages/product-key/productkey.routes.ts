import { Routes } from '@angular/router';
import { CreateupdateproductkeyComponent } from './createupdateproductkey/createupdateproductkey.component';


export const productkeyRoutes: Routes = [
  {
    path: 'create',
    component: CreateupdateproductkeyComponent,
  },
  {
    path: 'edit/:id',
    component: CreateupdateproductkeyComponent,
  },
];
