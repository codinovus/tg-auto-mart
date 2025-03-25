import { Routes } from '@angular/router';
import { CreateupdatedisputeComponent } from './createupdatedispute/createupdatedispute.component';
import { ListDisputeComponent } from './listdispute/listdispute.component';

export const disputeRoutes: Routes = [
  {
    path: 'create',
    component: CreateupdatedisputeComponent,
  },
  {
    path: 'edit/:id',
    component: CreateupdatedisputeComponent,
  },
  {
    path: '',
    component: ListDisputeComponent,
  },
];
