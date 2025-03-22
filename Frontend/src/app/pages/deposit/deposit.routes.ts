import { Routes } from '@angular/router';
import { CreateupdatedepositrequestComponent } from './createupdatedepositrequest/createupdatedepositrequest.component';

export const depositRoutes: Routes = [
  {
    path: 'create',
    component: CreateupdatedepositrequestComponent,
  },
  {
    path: 'edit/:id',
    component: CreateupdatedepositrequestComponent,
  },
];
