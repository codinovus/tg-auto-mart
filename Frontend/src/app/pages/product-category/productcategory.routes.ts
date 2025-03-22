import { Routes } from '@angular/router';
import { CreateupdateproductcategoryComponent } from './createupdateproductcategory/createupdateproductcategory.component';

export const productcategoryRoutes: Routes = [
  {
    path: 'create',
    component: CreateupdateproductcategoryComponent,
  },
  {
    path: 'edit/:id',
    component: CreateupdateproductcategoryComponent,
  },
];
