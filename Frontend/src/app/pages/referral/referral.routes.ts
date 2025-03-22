import { Routes } from '@angular/router';
import { CreateupdatereferralComponent } from './createupdatereferral/createupdatereferral.component';


export const referralRoutes: Routes = [
  {
    path: 'create',
    component: CreateupdatereferralComponent,
  },
  {
    path: 'edit/:id',
    component: CreateupdatereferralComponent,
  },
];
