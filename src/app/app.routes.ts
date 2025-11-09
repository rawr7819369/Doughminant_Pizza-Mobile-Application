import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'splash', pathMatch: 'full' },
  { path: 'splash', loadComponent: () => import('./pages/splash/splash.page').then(m => m.SplashPage) },
  { path: 'login', loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
  { path: 'signup', loadComponent: () => import('./pages/signup/signup.page').then(m => m.SignupPage) },

  { path: 'home', canActivate: [authGuard], loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage) },
  { path: 'pizza/:id', canActivate: [authGuard], loadComponent: () => import('./pages/pizza-details/pizza-details.page').then(m => m.PizzaDetailsPage) },
  { path: 'cart', canActivate: [authGuard], loadComponent: () => import('./pages/cart/cart.page').then(m => m.CartPage) },
  { path: 'payment', canActivate: [authGuard], loadComponent: () => import('./pages/payment/payment.page').then(m => m.PaymentPage) },
  { path: 'receipt', canActivate: [authGuard], loadComponent: () => import('./pages/receipt/receipt.page').then(m => m.ReceiptPage) },
  { path: 'order-history', canActivate: [authGuard], loadComponent: () => import('./pages/order-history/order-history.page').then(m => m.OrderHistoryPage) },
  { path: 'order-tracking/:id', canActivate: [authGuard], loadComponent: () => import('./pages/order-tracking/order-tracking.page').then(m => m.OrderTrackingPage) },
  { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage) },
  { path: 'feedback', canActivate: [authGuard], loadComponent: () => import('./pages/feedback/feedback.page').then(m => m.FeedbackPage) },
  { path: 'settings', canActivate: [authGuard], loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage) },
  { path: 'about-us', canActivate: [authGuard], loadComponent: () => import('./pages/about-us/about-us.page').then(m => m.AboutUsPage) },
];
