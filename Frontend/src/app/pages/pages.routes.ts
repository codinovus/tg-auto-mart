import { Routes } from '@angular/router';

export default [
    {
        path: 'user',
        loadChildren: () => import('./user/user.routes').then(m => m.userRoutes)
    },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
