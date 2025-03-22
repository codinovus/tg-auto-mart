import { Routes } from '@angular/router';
import { CreateupdatepromocodeComponent } from './createupdatepromocode/createupdatepromocode.component';


export const promocodeRoutes: Routes = [
  {
    path: 'create',
    component: CreateupdatepromocodeComponent,
  },
  {
    path: 'edit/:id',
    component: CreateupdatepromocodeComponent,
  },
];
