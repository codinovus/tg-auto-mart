import { Routes } from '@angular/router';
import { CreatupdateuserComponent } from './creatupdateuser/creatupdateuser.component';
import { ListUserComponent } from './list-user/list-user.component';

export const userRoutes: Routes = [
    {
        path: '',
        component: ListUserComponent
    },
    {
        path: 'create',
        component: CreatupdateuserComponent
    },
    {
        path: 'edit/:id',
        component: CreatupdateuserComponent
    }
];
