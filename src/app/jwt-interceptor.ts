import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './core/services/auth';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Se abbiamo un token, modifichiamo la richiesta attaccandoci il braccialetto VIP
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}` // Questa è la parola magica che aspetta Spring!
      }
    });
    return next(clonedReq);
  }

  // Se non abbiamo un token (es. stiamo facendo il login), passiamo la richiesta così com'è
  return next(req);
};