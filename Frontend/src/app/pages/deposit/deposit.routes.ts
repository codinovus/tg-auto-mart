import { Routes } from '@angular/router';
import { CreateupdatedepositrequestComponent } from './createupdatedepositrequest/createupdatedepositrequest.component';
import { ListDepositRequestComponent } from './listdepositrequest/listdepositrequest.component';

export const depositRoutes: Routes = [
  {
    path: 'create',
    component: CreateupdatedepositrequestComponent,
  },
  {
    path: 'edit/:id',
    component: CreateupdatedepositrequestComponent,
  },
  {
    path: '',
    component: ListDepositRequestComponent,
  },
];
