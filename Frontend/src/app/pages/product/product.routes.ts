import { Routes } from '@angular/router';
import { CreateupdateproductComponent } from './createupdateproduct/createupdateproduct.component';
import { ListProductComponent } from './listproduct/listproduct.component';

export const productRoutes: Routes = [
  {
    path: 'create',
    component: CreateupdateproductComponent,
  },
  {
    path: 'edit/:id',
    component: CreateupdateproductComponent,
  },
  {
    path: '',
    component: ListProductComponent
  }
];
