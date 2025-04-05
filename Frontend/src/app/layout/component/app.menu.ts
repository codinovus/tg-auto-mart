import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu implements OnInit {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/'] }]
            },
            {
                label: 'Users Management',
                items: [
                    {
                        label: 'Users',
                        icon: 'pi pi-users',
                        items: [
                            { label: 'All Users', icon: 'pi pi-list', routerLink: ['/pages/user'] },
                        ]
                    }
                ]
            },
            {
                label: 'Wallet & Finances',
                items: [
                    {
                        label: 'Wallets',
                        icon: 'pi pi-wallet',
                        items: [
                            { label: 'User Wallets', icon: 'pi pi-money-bill', routerLink: ['/pages/wallet'] },
                            { label: 'Refund Wallets', icon: 'pi pi-replay', routerLink: ['/pages/crypto-wallet'] }
                        ]
                    },
                    {
                        label: 'Transactions',
                        icon: 'pi pi-sync',
                        items: [
                            { label: 'All Transactions', icon: 'pi pi-list', routerLink: ['/pages/transaction'] },
                        ]
                    },
                    {
                        label: 'Deposits',
                        icon: 'pi pi-arrow-down',
                        items: [
                            { label: 'Deposit Requests', icon: 'pi pi-inbox', routerLink: ['/pages/deposit'] }
                        ]
                    },
                    // {
                    //     label: 'Gateway Transactions',
                    //     icon: 'pi pi-arrow-up',
                    //     items: [
                    //         { label: 'All Gateway Transactions', icon: 'pi pi-list', routerLink: ['/pages/gateway-transactions'] },
                    //         { label: 'Failed Gateway Transactions', icon: 'pi pi-times-circle', routerLink: ['/pages/failed-gateway-transactions'] }
                    //     ]
                    // }
                ]
            },
            {
                label: 'Products',
                items: [
                    {
                        label: 'Product Categories',
                        icon: 'pi pi-tags',
                        items: [
                            { label: 'All Categories', icon: 'pi pi-list', routerLink: ['/pages/product-category'] },
                            { label: 'Add Category', icon: 'pi pi-plus', routerLink: ['/pages/product-category/create'] }
                        ]
                    },
                    {
                        label: 'Products',
                        icon: 'pi pi-shopping-bag',
                        items: [
                            { label: 'All Products', icon: 'pi pi-list', routerLink: ['/pages/product'] },
                            { label: 'Add Product', icon: 'pi pi-plus', routerLink: ['/pages/product/create'] }
                        ]
                    },
                    {
                        label: 'Product Keys',
                        icon: 'pi pi-key',
                        items: [
                            { label: 'All Keys', icon: 'pi pi-list', routerLink: ['/pages/product-key'] },
                            { label: 'Add Key', icon: 'pi pi-plus', routerLink: ['/pages/product-key/create'] }
                        ]
                    }
                ]
            },
            {
                label: 'Orders & Payments',
                items: [
                    { label: 'Orders', icon: 'pi pi-shopping-cart', routerLink: ['/pages/order'] },
                    { label: 'Payments', icon: 'pi pi-credit-card', routerLink: ['/pages/payment'] }
                ]
            },
            {
                label: 'Referrals & Promotions',
                items: [
                    { label: 'Referrals', icon: 'pi pi-share-alt', routerLink: ['/pages/refral'] },
                ]
            }
        ];
    }
}
