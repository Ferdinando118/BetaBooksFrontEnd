import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { FormLibro } from './features/admin/form-libro/form-libro';
import { adminGuard } from './core/guards/admin-guard';
import { EmailValidation } from './features/auth/pages/email-validation/email-validation';
import { RecuperoPassword } from './features/recupero-password/recupero-password';
import { NuovaPassword } from './features/nuova-password/nuova-password';


export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  { 
  path: 'admin/nuovo-libro', 
  component: FormLibro, 
  canActivate: [adminGuard] 
},
{ 
  path: 'admin/modifica-libro/:id', 
  component: FormLibro, 
  canActivate: [adminGuard] 
},
  {
    path: 'cart',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/cart/cart.module').then(m => m.CartModule)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/profile/profile.module').then(m => m.ProfileModule)
  },
  { 
    path: 'emailValidation/:email',
    component: EmailValidation
  },
  {
    path: 'recupero-password',
    component: RecuperoPassword
  },
  { 
    path: 'nuova-password', 
    component: NuovaPassword 
  },
  { path: '**', redirectTo: '' }
];