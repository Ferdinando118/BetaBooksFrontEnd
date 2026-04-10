import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { PasswordRecoveryReq, PasswordReq, Resp, Utente } from '../models/models';

interface AuthResponse {
  token: string;
  utente: Utente;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API_UTENTI = 'http://localhost:8080/api/utenti';
  private readonly API_AUTH = 'http://localhost:8080/api/auth'; 

  grant = signal({
    isLogged: false,
    isAdmin: false,
    token: null as string | null,
    utente: null as Utente | null
  });



constructor(
  private http: HttpClient, 
  private router: Router,
  @Inject(PLATFORM_ID) private platformId: Object
) {
  if (isPlatformBrowser(this.platformId)) {
    const token = localStorage.getItem('bb_token');
    /*
    if (token) {
      // Invece di fidarci solo del localStorage, chiediamo conferma al server
      this.checkMe().subscribe({
        next: (u) => console.log("Sessione ripristinata per:", u.email),
        error: () => this.logout() // Se il server dice 401, puliamo tutto
      });
    }*/

      if (token) {
  this.checkMe().subscribe({
    next: (u) => console.log("Sessione ripristinata:", u.email),
    error: (err) => {
      // Slogga solo se le credenziali sono scadute/invalide
      // Non slogga se il backend è temporaneamente down
      if (err.status === 401 || err.status === 403) {
        this.logout();
      }
    }
  });
}
  }
}


login(email: string, password: string): Observable<any> {
  // 1. Generiamo il token SUBITO
 // const basicToken = btoa(unescape(encodeURIComponent(`${email}:${password}`)));
 const basicToken = btoa(
  Array.from(
    new TextEncoder().encode(`${email}:${password}`)
  ).map(b => String.fromCharCode(b)).join('')
);
  /*
  // Rimuovi eventuali vecchi dati sporchi prima di settare i nuovi
    localStorage.removeItem('bb_token');
  // 2. Lo salviamo temporaneamente per farlo usare all'interceptor 
  // o lo passiamo manualmente nella chiamata
  localStorage.setItem('bb_token', basicToken);

  // 3. Invece di /login (POST), usiamo /me (GET) come test di ingresso
  return this.http.get<Utente>(`${this.API_AUTH}/me`).pipe(
    tap(utenteLoggato => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('bb_utente', JSON.stringify(utenteLoggato));
        
        // Aggiorniamo il signal
        this.grant.set({
          isLogged: true,
          isAdmin: utenteLoggato.ruolo === 'ADMIN',
          token: basicToken,
          utente: utenteLoggato
        });
      }
    })
  );
}*/

 return this.http.get<Utente>(`${this.API_AUTH}/me`, {
    headers: { Authorization: `Basic ${basicToken}` }
  }).pipe(
    tap(utente => {
      // Salva solo DOPO che il server ha confermato le credenziali
      localStorage.setItem('bb_token', basicToken);
      localStorage.setItem('bb_utente', JSON.stringify(utente));

      this.grant.set({
        isLogged: true,
        isAdmin: utente.ruolo === 'ADMIN',
        token: basicToken,
        utente
      });
    })
  );
}
  register(data: { email: string; password: string }): Observable<Utente> {
    return this.http.post<Utente>(`${this.API_UTENTI}/register`, data);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('bb_token');
      localStorage.removeItem('bb_utente');
      
      this.grant.set({
        isLogged: false,
        isAdmin: false,
        token: null,
        utente: null
      });
      this.router.navigate(['/auth/login']);
    }
  }


checkMe(): Observable<Utente> {
  return this.http.get<Utente>(`${this.API_AUTH}/me`).pipe(
    tap(utente => {
      if (isPlatformBrowser(this.platformId)) {
        // Se il server risponde, aggiorniamo il Signal con i dati freschi
        this.grant.set({
          isLogged: true,
          isAdmin: utente.ruolo === 'ADMIN',
          token: localStorage.getItem('bb_token'),
          utente: utente
        });
        localStorage.setItem('bb_utente', JSON.stringify(utente));
      }
    })
  );
}

verificaMail(email: string): Observable<Resp> {
  const params = new HttpParams().set('email', email);
  return this.http.get<Resp>(`${this.API_UTENTI}/sendValidation`, { params });
}

attivaValidazione(email: string): Observable<Resp> {
  const params = new HttpParams().set('email', email);
  return this.http.get<Resp>(`${this.API_UTENTI}/emailValidate`, { params });
}

cambiaPassword(pwdReq: PasswordReq): Observable<Resp> {
  return this.http.post<Resp>(`${this.API_UTENTI}/cambiaPassword`, pwdReq);
}

emailCambioPassword(email: string): Observable<any> {
  return this.http.get(`${this.API_UTENTI}/request-password-recovery?email=${email}`);
}

confirmPasswordRecovery(data: PasswordRecoveryReq): Observable<any> {
  return this.http.post(`${this.API_UTENTI}/confirm-password-recovery`, data);
}



  // Comodi metodi per leggere velocemente lo stato
  getToken(): string | null { return this.grant().token; }
  isLoggedIn(): boolean { return this.grant().isLogged; }
  isAdmin(): boolean { return this.grant().isAdmin; }
  isValidato() {return this.grant().utente?.validato}
}