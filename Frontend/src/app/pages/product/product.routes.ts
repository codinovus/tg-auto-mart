import { Routes } from '@angular/router';
import { CreateupdateproductComponent } from './createupdateproduct/createupdateproduct.component';

export const productRoutes: Routes = [
  {
    path: 'create',
    component: CreateupdateproductComponent,
  },
  {
    path: 'edit/:id',
    component: CreateupdateproductComponent,
  },
];
