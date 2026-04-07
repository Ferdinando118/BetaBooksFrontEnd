import { HttpInterceptorFn } from '@angular/common/http';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('bb_token');
  
  if (token && !req.url.includes('/uploads/')) { 
    // PULIZIA: toglie le virgolette se presenti
    const cleanToken = token.replace(/"/g, ''); 
    
    const authReq = req.clone({
      setHeaders: { 
        // IMPORTANTE: USA cleanToken, NON token!
        Authorization: `Basic ${cleanToken}` 
      },
      withCredentials: true
    });
    return next(authReq);
  }
  
  return next(req.clone({ withCredentials: true }));
};