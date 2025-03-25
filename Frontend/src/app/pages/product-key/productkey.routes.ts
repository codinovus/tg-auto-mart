import { Routes } from '@angular/router';
import { CreateupdateproductkeyComponent } from './createupdateproductkey/createupdateproductkey.component';
import { ListProductKeyComponent } from './listproduct-key/listproduct-key.component';


export const productkeyRoutes: Routes = [
  {
    path: 'create',
    component: CreateupdateproductkeyComponent,
  },
  {
    path: 'edit/:id',
    component: CreateupdateproductkeyComponent,
  },
  {
    path: '',
    component: ListProductKeyComponent,
  },
];
