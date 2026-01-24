import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
    },
    {
        path: 'audits',
        loadComponent: () => import('./features/audits/audit-list/audit-list').then(m => m.AuditList)
    },
    {
        path: 'audits/new',
        loadComponent: () => import('./features/audits/audit-form/audit-form').then(m => m.AuditForm)
    },
    {
        path: 'audits/:id',
        loadComponent: () => import('./features/audits/audit-detail/audit-detail').then(m => m.AuditDetail)
    },
    {
        path: 'audits/:id/edit',
        loadComponent: () => import('./features/audits/audit-form/audit-form').then(m => m.AuditForm)
    },
    {
        path: 'reports/:id',
        loadComponent: () => import('./features/reports/report-viewer').then(m => m.ReportViewer)
    },
    {
        path: 'teams',
        loadComponent: () => import('./features/teams/team-list/team-list').then(m => m.TeamListComponent)
    },
    {
        path: 'teams/new',
        loadComponent: () => import('./features/teams/team-form/team-form').then(m => m.TeamFormComponent)
    },
    {
        path: 'teams/edit/:id',
        loadComponent: () => import('./features/teams/team-form/team-form').then(m => m.TeamFormComponent)
    }
];
