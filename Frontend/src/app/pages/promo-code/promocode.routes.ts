import { Routes } from '@angular/router';
import { CreateupdatepromocodeComponent } from './createupdatepromocode/createupdatepromocode.component';
import { ListPromoCodeComponent } from './listpromo-code/listpromo-code.component';


export const promocodeRoutes: Routes = [
  {
    path: 'create',
    component: CreateupdatepromocodeComponent,
  },
  {
    path: 'edit/:id',
    component: CreateupdatepromocodeComponent,
  },
  {
    path: '',
    component: ListPromoCodeComponent,
  },
];
