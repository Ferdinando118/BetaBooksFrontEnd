import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export function skipUploadsInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  // Se la richiesta riguarda le immagini /uploads, non mandiamo credenziali
  if (req.url.includes('/uploads/')) {
    const clone = req.clone({ withCredentials: false });
    return next(clone);
  }
  return next(req);
}