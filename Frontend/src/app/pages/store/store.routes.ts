import { Routes } from '@angular/router';
import { CreateupdatestoreComponent } from './createupdatestore/createupdatestore.component';


export const storeRoutes: Routes = [
  {
    path: 'create',
    component: CreateupdatestoreComponent,
  },
  {
    path: 'edit/:id',
    component: CreateupdatestoreComponent,
  },
];
