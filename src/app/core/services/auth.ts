import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Utente } from '../models/models';

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
    const utenteSalvato = localStorage.getItem('bb_utente');

    // 1. RIPRISTINO IMMEDIATO (Sincrono)
    // Questo permette alla Guardia di leggere i permessi all'istante!
    if (token && utenteSalvato) {
      const utente = JSON.parse(utenteSalvato);
      this.grant.set({
        isLogged: true,
        isAdmin: utente.ruolo === 'ADMIN',
        token: token,
        utente: utente
      });
      console.log("Sessione recuperata localmente:", utente.email);
    }

    // 2. VERIFICA DI SICUREZZA (Asincrono)
    // Questo conferma che il token sia ancora valido sul server
    if (token) {
      this.checkMe().subscribe({
        next: (u) => console.log("Sessione confermata dal server per:", u.email),
        error: (err) => {
          // Se il server dice che il token non è più valido (401 o 403), facciamo logout
          if (err.status === 401 || err.status === 403) {
            console.warn("Sessione scaduta o non valida, eseguo logout.");
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

  // Comodi metodi per leggere velocemente lo stato
  getToken(): string | null { return this.grant().token; }
  isLoggedIn(): boolean { return this.grant().isLogged; }
  isAdmin(): boolean { return this.grant().isAdmin; }

  getUserId(): number | null {
    const utente = this.grant().utente;
    return utente ? utente.id : null;
  }
}