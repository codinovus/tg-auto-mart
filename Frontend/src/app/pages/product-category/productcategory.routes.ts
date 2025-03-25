import { Routes } from '@angular/router';
import { CreateupdateproductcategoryComponent } from './createupdateproductcategory/createupdateproductcategory.component';
import { ListProductCategoryComponent } from './listproduct-category/listproduct-category.component';

export const productcategoryRoutes: Routes = [
  {
    path: 'create',
    component: CreateupdateproductcategoryComponent,
  },
  {
    path: 'edit/:id',
    component: CreateupdateproductcategoryComponent,
  },
  {
    path: '',
    component: ListProductCategoryComponent
  }
];
