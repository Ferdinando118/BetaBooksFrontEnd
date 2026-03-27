import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth'; // Verifica che il percorso sia corretto

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Verifichiamo se l'utente è ADMIN usando il metodo che hai già nel service
  if (auth.isLoggedIn() && auth.isAdmin()) {
    return true;
  }

  // Se non è admin, lo riportiamo al catalogo o alla login
  console.warn('Accesso negato: l\'utente non è un amministratore.');
  router.navigate(['/catalogo']); 
  return false;
};