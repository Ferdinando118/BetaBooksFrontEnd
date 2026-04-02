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
    // Al riavvio dell'app (es. F5), recuperiamo i dati dal localStorage per non far sbloccare l'utente
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('bb_token');
      const utenteStr = localStorage.getItem('bb_utente');
      
      if (token && utenteStr) {
        const utente: Utente = JSON.parse(utenteStr);
        this.grant.set({
          isLogged: true,
          isAdmin: utente.ruolo === 'ADMIN',
          token: token,
          utente: utente
        });
      }
    }
  }*/
 // Nel tuo auth.ts (AuthService)
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
}
/*
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_AUTH}/login`, { email, password }).pipe(
      tap(res => {
        if (isPlatformBrowser(this.platformId)) {
          // Salviamo i dati al sicuro nel browser
          localStorage.setItem('bb_token', res.token);
          localStorage.setItem('bb_utente', JSON.stringify(res.utente));
          
          // Aggiorniamo il signal (la UI si aggiornerà automaticamente!)
          this.grant.set({
            isLogged: true,
            isAdmin: res.utente.ruolo === 'ADMIN',
            token: res.token,
            utente: res.utente
          });
        }
      })
    );
  }*/

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

  // Comodi metodi per leggere velocemente lo stato
  getToken(): string | null { return this.grant().token; }
  isLoggedIn(): boolean { return this.grant().isLogged; }
  isAdmin(): boolean { return this.grant().isAdmin; }
}