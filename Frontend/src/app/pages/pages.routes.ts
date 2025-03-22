import { storeRoutes } from './store/store.routes';
import { Routes } from '@angular/router';

export default [
    {
        path: 'user',
        loadChildren: () => import('./user/user.routes').then(m => m.userRoutes)
    },
    {
        path: 'store',
        loadChildren: () => import('./store/store.routes').then(m => m.storeRoutes)
    },
    {
        path: 'crypto-wallet',
        loadChildren: () => import('./crypto-wallet/cryptowallet.routes').then(m => m.cryptowalletRoutes)
    },
    {
        path: 'deposit',
        loadChildren: () => import('./deposit/deposit.routes').then(m => m.depositRoutes)
    },
    {
        path: 'dispute',
        loadChildren: () => import('./dispute/dispute.routes').then(m => m.disputeRoutes)
    },
    {
        path: 'order',
        loadChildren: () => import('./order/order.routes').then(m => m.orderRoutes)
    },
    {
        path: 'payment',
        loadChildren: () => import('./payment/payment.routes').then(m => m.paymentRoutes)
    },
    {
        path: 'product-category',
        loadChildren: () => import('./product-category/productcategory.routes').then(m => m.productcategoryRoutes)
    },
    {
        path: 'wallet',
        loadChildren: () => import('./wallet/wallet.routes').then(m => m.walletRoutes)
    },
    {
        path: 'product',
        loadChildren: () => import('./product/product.routes').then(m => m.productRoutes)
    },
    {
        path: 'product-key',
        loadChildren: () => import('./product-key/productkey.routes').then(m => m.productkeyRoutes)
    },
    {
        path: 'promo-code',
        loadChildren: () => import('./promo-code/promocode.routes').then(m => m.promocodeRoutes)
    },
    {
        path: 'refral',
        loadChildren: () => import('./referral/referral.routes').then(m => m.referralRoutes)
    },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
