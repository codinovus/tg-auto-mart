import { Routes } from '@angular/router';
import { CreateupdatedisputeComponent } from './createupdatedispute/createupdatedispute.component';

export const disputeRoutes: Routes = [
  {
    path: 'create',
    component: CreateupdatedisputeComponent,
  },
  {
    path: 'edit/:id',
    component: CreateupdatedisputeComponent,
  },
];
