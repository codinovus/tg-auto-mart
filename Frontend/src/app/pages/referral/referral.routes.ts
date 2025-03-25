import { Routes } from '@angular/router';
import { CreateupdatereferralComponent } from './createupdatereferral/createupdatereferral.component';
import { ListReferralComponent } from './listreferral/listreferral.component';


export const referralRoutes: Routes = [
  {
    path: 'create',
    component: CreateupdatereferralComponent,
  },
  {
    path: 'edit/:id',
    component: CreateupdatereferralComponent,
  },
  {
    path: '',
    component: ListReferralComponent,
  },
];
