import { Routes } from '@angular/router';
import { Access } from './access';
import { Login } from './login';
import { Error } from './error';
import { AuthGuard } from '../../shared/auth.guard';
import { NoAuthGuard } from '../../shared/noauth.guard';


export default [
    {
        path: 'access',
        component: Access,
        canActivate: [AuthGuard]
    },
    {
        path: 'error',
        component: Error
    },
    {
        path: 'login',
        component: Login,
        canActivate: [NoAuthGuard]
    }
] as Routes;
