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

  // Usiamo il SIGNAL come nell'esempio che mi hai dato!
  grant = signal({
    isLogged: false,
    isAdmin: false,
    token: null as string | null,
    utente: null as Utente | null
  });

/*
constructor(
  private http: HttpClient, 
  private router: Router,
  @Inject(PLATFORM_ID) private platformId: Object
) {
  if (isPlatformBrowser(this.platformId)) {
    const token = localStorage.getItem('bb_token');
    const utenteStr = localStorage.getItem('bb_utente');
    
    // CONTROLLO DI SICUREZZA: Verifichiamo che i dati esistano e non siano "undefined"
    if (token && utenteStr && utenteStr !== 'undefined') {
      try {
        const utente: Utente = JSON.parse(utenteStr);
        this.grant.set({
          isLogged: true,
          isAdmin: utente.ruolo === 'ADMIN',
          token: token,
          utente: utente
        });
      } catch (e) {
        console.error("Errore nel recupero utente dal localStorage", e);
        this.logout(); // Puliamo tutto se il JSON è rotto
      }
    }
  }
}*/

constructor(
  private http: HttpClient, 
  private router: Router,
  @Inject(PLATFORM_ID) private platformId: Object
) {
  if (isPlatformBrowser(this.platformId)) {
    const token = localStorage.getItem('bb_token');
    
    if (token) {
      // Invece di fidarci solo del localStorage, chiediamo conferma al server
      this.checkMe().subscribe({
        next: (u) => console.log("Sessione ripristinata per:", u.email),
        error: () => this.logout() // Se il server dice 401, puliamo tutto
      });
    }
  }
}

/*
    login(email: string, password: string): Observable<any> {
  return this.http.post<any>(`${this.API_AUTH}/login`, { email, password }).pipe(
    tap(res => {
      if (isPlatformBrowser(this.platformId)) {
        // 'res' è già l'utente (id, email, ruolo) perché Java manda UtenteDTO
        const utenteLoggato: Utente = res; 

        // Salviamo un token finto per ora, visto che non abbiamo ancora il JWT
        localStorage.setItem('bb_token', 'finto-token-per-ora');
        localStorage.setItem('bb_utente', JSON.stringify(utenteLoggato));
        
        // Aggiorniamo il signal
        this.grant.set({
          isLogged: true,
          isAdmin: utenteLoggato.ruolo === 'ADMIN',
          token: 'finto-token-per-ora',
          utente: utenteLoggato
        });
        
        console.log("LOGIN COMPLETATO CON SUCCESSO!", utenteLoggato);
      }
    })
  );
}*/

login(email: string, password: string): Observable<any> {
  // 1. Generiamo il token SUBITO
  const basicToken = btoa(unescape(encodeURIComponent(`${email}:${password}`)));
  
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
}