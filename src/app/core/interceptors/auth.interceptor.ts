
import { HttpInterceptorFn } from '@angular/common/http';
/*
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('bb_token');
  
  if (token && !req.url.includes('/uploads/')) { 
    
    const cleanToken = token.replace(/"/g, ''); 
    
    const authReq = req.clone({
      setHeaders: { 
        
        Authorization: `Basic ${cleanToken}` 
      },
      withCredentials: true
    });
    return next(authReq);
  }
  
  return next(req.clone({ withCredentials: true }));
};*/

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('bb_token');
  
  const isPublic = req.url.includes('/uploads/') || 
                   req.url.includes('/api/utenti/register') || 
                   req.url.includes('/api/auth/login');

  if (token && !isPublic) {
    const cleanToken = token.replace(/"/g, ''); 
    const authReq = req.clone({
      setHeaders: { Authorization: `Basic ${cleanToken}` },
      withCredentials: true
    });
    return next(authReq);
  }
  
  return next(req.clone({ withCredentials: true }));
};