import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CarrelloDTO } from '../models/models'; // Verifica che il percorso sia corretto
import { AuthService } from './auth'; // Assicurati di importare il tuo AuthService

@Injectable({ providedIn: 'root' })
export class CarrelloService {
  private readonly API = 'http://localhost:8080/api/carrello';
  

  private http = inject(HttpClient);
  private auth = inject(AuthService);

  
  private carrelloSubject = new BehaviorSubject<CarrelloDTO | null>(null);
  carrello$ = this.carrelloSubject.asObservable();

  
  private get userId(): number {
    const utenteLoggato = this.auth.grant().utente;
    return utenteLoggato ? utenteLoggato.id : 0;
  }

  constructor() {
    if (this.userId !== 0) {
      this.loadCarrello();
    }
  }

  
  loadCarrello(): void {
    const id = this.userId;
    if (id === 0) {
      console.warn('CarrelloService: Nessun utente loggato, impossibile caricare il carrello.');
      return;
    }

    this.http.get<CarrelloDTO>(`${this.API}/utente/${id}`).subscribe({
      next: (res) => {
        console.log('Carrello caricato con successo:', res);
        this.carrelloSubject.next(res);
      },
      error: (err) => {
        console.error('Errore durante il caricamento del carrello:', err);
        this.carrelloSubject.next(null);
      }
    });
  }

  
  aggiungi(idFormatoLibro: number, quantita: number = 1): Observable<any> {
    const req = { 
      idUtente: this.userId, 
      idFormatoLibro: idFormatoLibro,
      quantita: quantita 
    };

    return this.http.post(`${this.API}/aggiungiProdotto`, req).pipe(
      tap(() => this.loadCarrello()) 
    );
  }

  
  aumenta(idItem: number): Observable<any> {
    return this.http.patch(`${this.API}/item/${idItem}/aumenta`, {}).pipe(
      tap(() => this.loadCarrello())
    );
  }

 
  diminuisci(idItem: number): Observable<any> {
    return this.http.patch(`${this.API}/item/${idItem}/decrementa`, {}).pipe(
      tap(() => this.loadCarrello())
    );
  }

  
  rimuovi(idItem: number): Observable<any> {
    return this.http.delete(`${this.API}/item/${idItem}/elimina`).pipe(
      tap(() => this.loadCarrello())
    );
  }

  
  spostaInWishlist(idItem: number): Observable<any> {
    return this.http.post(`${this.API}/item/${idItem}/sposta-in-wishlist`, {}).pipe(
      tap(() => this.loadCarrello())
    );
  }

  
  svuota(): Observable<any> {
    const id = this.userId;
    return this.http.delete(`${this.API}/svuota/${id}`).pipe(
      tap(() => {
        this.carrelloSubject.next(null); 
        console.log('Carrello svuotato.');
      })
    );
  }
}