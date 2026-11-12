import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { BooknestService, Role } from './booknest.service';

const roleGate: CanActivateFn = (route) => {
  const store = inject(BooknestService);
  const router = inject(Router);
  const allowed = route.data['roles'] as Role[];
  const user = store.currentUser();
  if (user && allowed.includes(user.role)) return true;
  return router.createUrlTree(['/login'], { queryParams: { next: route.routeConfig?.path } });
};

export const routes: Routes = [
  { path: '', title: 'Overview · BookNest', loadComponent: () => import('./pages/home.page').then(m => m.HomePage) },
  { path: 'shop', title: 'Bookshop · BookNest', loadComponent: () => import('./pages/shop.page').then(m => m.ShopPage) },
  { path: 'workshops', title: 'Workshops · BookNest', loadComponent: () => import('./pages/workshops.page').then(m => m.WorkshopsPage) },
  { path: 'fees', title: 'Student fees · BookNest', canActivate: [roleGate], data: { roles: ['student', 'accountant', 'admin'] }, loadComponent: () => import('./pages/fees.page').then(m => m.FeesPage) },
  { path: 'finance', title: 'Department budgets · BookNest', canActivate: [roleGate], data: { roles: ['accountant', 'admin'] }, loadComponent: () => import('./pages/finance.page').then(m => m.FinancePage) },
  { path: 'payroll', title: 'Staff payroll · BookNest', canActivate: [roleGate], data: { roles: ['accountant', 'admin'] }, loadComponent: () => import('./pages/payroll.page').then(m => m.PayrollPage) },
  { path: 'inventory', title: 'Stock management · BookNest', canActivate: [roleGate], data: { roles: ['admin'] }, loadComponent: () => import('./pages/inventory.page').then(m => m.InventoryPage) },
  { path: 'people', title: 'People & access · BookNest', canActivate: [roleGate], data: { roles: ['admin'] }, loadComponent: () => import('./pages/people.page').then(m => m.PeoplePage) },
  { path: 'profile', title: 'My profile · BookNest', loadComponent: () => import('./pages/profile.page').then(m => m.ProfilePage) },
  { path: 'login', title: 'Sign in · BookNest', loadComponent: () => import('./pages/login.page').then(m => m.LoginPage) },
  { path: 'signup', title: 'Join BookNest · BookNest', loadComponent: () => import('./pages/signup.page').then(m => m.SignupPage) },
  { path: '**', title: 'Not found · BookNest', loadComponent: () => import('./pages/not-found.page').then(m => m.NotFoundPage) },
];
