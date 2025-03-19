import { Component } from '@angular/core';
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
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'fas fa-home', routerLink: ['/'] }]
            },
            {
                label: 'Users Management',
                items: [
                    { label: 'Form Layout', icon: 'fas fa-id-card', routerLink: ['/uikit/formlayout'] },
                ]
            },
            {
                label: 'Wallet & Finances',
                items: [
                    { label: 'Form Layout', icon: 'fas fa-id-card', routerLink: ['/uikit/formlayout'] },
                ]
            },
            {
                label: 'Products',
                items: [
                    { label: 'Form Layout', icon: 'fas fa-id-card', routerLink: ['/uikit/formlayout'] },
                ]
            },
            {
                label: 'Orders & Payments',
                items: [
                    { label: 'Form Layout', icon: 'fas fa-id-card', routerLink: ['/uikit/formlayout'] },
                ]
            },
            {
                label: 'Disputes & Support',
                items: [
                    { label: 'Form Layout', icon: 'fas fa-id-card', routerLink: ['/uikit/formlayout'] },
                ]
            },
            {
                label: 'Referrals & Promotions',
                items: [
                    { label: 'Form Layout', icon: 'fas fa-id-card', routerLink: ['/uikit/formlayout'] },
                ]
            },
            {
                label: 'Developer Management',
                items: [
                    { label: 'Form Layout', icon: 'fas fa-id-card', routerLink: ['/uikit/formlayout'] },
                ]
            },
        ];
    }
}
