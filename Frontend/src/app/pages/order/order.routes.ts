import { Routes } from '@angular/router';
import { CreateupdateorderComponent } from './createupdateorder/createupdateorder.component';
import { ListOrderComponent } from './listorder/listorder.component';

export const orderRoutes: Routes = [
  {
    path: 'create',
    component: CreateupdateorderComponent,
  },
  {
    path: 'edit/:id',
    component: CreateupdateorderComponent,
  },
  {
    path:'',
    component: ListOrderComponent
  }
];
