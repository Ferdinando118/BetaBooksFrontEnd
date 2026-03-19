import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Utente, RuoloUtente } from '../models/models';

interface AuthResponse {
  token: string;
  utente: Utente;
}

// ── Utenti mock (da rimuovere quando il backend è pronto) ──
const MOCK_USERS = [
  { email: 'admin@betabooks.it',  password: 'admin123', ruolo: RuoloUtente.ADMIN, nome: 'Admin',     cognome: 'BetaBooks' },
  { email: 'user@betabooks.it',   password: 'user123',  ruolo: RuoloUtente.USER,  nome: 'Mario',     cognome: 'Rossi' },
  { email: 'test@betabooks.it',   password: 'test123',  ruolo: RuoloUtente.USER,  nome: 'Giulia',    cognome: 'Bianchi' },
];

const USE_MOCK = true; // ← metti false quando il backend è pronto

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API       = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'bb_token';
  private readonly USER_KEY  = 'bb_user';

  private utenteSubject = new BehaviorSubject<Utente | null>(this.loadUser());
  utente$ = this.utenteSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<AuthResponse> {
    if (USE_MOCK) return this.mockLogin(email, password);

    return this.http.post<AuthResponse>(`${this.API}/login`, { email, password }).pipe(
      tap(res => this.salvaSessione(res))
    );
  }

  register(data: { email: string; password: string; nome: string; cognome: string }): Observable<AuthResponse> {
    if (USE_MOCK) return this.mockRegister(data);

    return this.http.post<AuthResponse>(`${this.API}/register`, data).pipe(
      tap(res => this.salvaSessione(res))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.utenteSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null    { return localStorage.getItem(this.TOKEN_KEY); }
  isLoggedIn(): boolean        { return !!this.getToken(); }
  getUtente(): Utente | null   { return this.utenteSubject.value; }
  isAdmin(): boolean           { return this.utenteSubject.value?.ruolo === RuoloUtente.ADMIN; }

  // ── MOCK ────────────────────────────────────────────────────
  private mockLogin(email: string, password: string): Observable<AuthResponse> {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) return throwError(() => new Error('Credenziali errate'));

    const res: AuthResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      utente: { id: 1, email: found.email, ruolo: found.ruolo }
    };
    this.salvaSessione(res);
    return of(res).pipe(delay(500));
  }

  private mockRegister(data: { email: string; password: string; nome: string; cognome: string }): Observable<AuthResponse> {
    const esiste = MOCK_USERS.find(u => u.email === data.email);
    if (esiste) return throwError(() => new Error('Email già in uso'));

    const res: AuthResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      utente: { id: Date.now(), email: data.email, ruolo: RuoloUtente.USER }
    };
    this.salvaSessione(res);
    return of(res).pipe(delay(500));
  }

  // ── SHARED ──────────────────────────────────────────────────
  private salvaSessione(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.utente));
    this.utenteSubject.next(res.utente);
  }

  private loadUser(): Utente | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}















/*import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Utente } from '../models/models';

interface AuthResponse {
  token: string;
  utente: Utente;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'bb_token';
  private readonly USER_KEY  = 'bb_user';

  private utenteSubject = new BehaviorSubject<Utente | null>(this.loadUser());
  utente$ = this.utenteSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, { email, password }).pipe(
      tap(res => this.salvaSessione(res))
    );
  }

  register(data: { email: string; password: string; nome: string; cognome: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, data).pipe(
      tap(res => this.salvaSessione(res))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.utenteSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUtente(): Utente | null {
    return this.utenteSubject.value;
  }

  isAdmin(): boolean {
    return this.utenteSubject.value?.ruolo === 'ADMIN';
  }

  private salvaSessione(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.utente));
    this.utenteSubject.next(res.utente);
  }

  private loadUser(): Utente | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
  */