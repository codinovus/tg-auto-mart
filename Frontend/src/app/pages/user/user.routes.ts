import { Routes } from '@angular/router';
import { CreatupdateuserComponent } from './creatupdateuser/creatupdateuser.component';

export const userRoutes: Routes = [
  {
    path: 'create',
    component: CreatupdateuserComponent,
  },
  {
    path: 'edit/:id',
    component: CreatupdateuserComponent,
  },
];
