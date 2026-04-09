import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth'; // Verifica che il percorso sia corretto

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isLogged = auth.isLoggedIn();
  const isAdmin = auth.isAdmin();

  console.log('Controllo AdminGuard - Logged:', isLogged, 'Admin:', isAdmin);

  if (isLogged && isAdmin) {
    return true;
  }

  // Se arriviamo qui, l'accesso è negato
  console.warn('Accesso negato: reindirizzamento in corso...');
  router.navigate(['/']); 
  return false;
};