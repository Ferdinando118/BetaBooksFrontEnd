import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CarrelloDTO } from '../models/models'; // Verifica che il percorso sia corretto
import { AuthService } from './auth'; // Assicurati di importare il tuo AuthService

@Injectable({ providedIn: 'root' })
export class CarrelloService {
  private readonly API = 'http://localhost:8080/api/carrello';
  
  // Dependency Injection moderna (Angular 14+)
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  // Subject per notificare i componenti quando il carrello cambia
  private carrelloSubject = new BehaviorSubject<CarrelloDTO | null>(null);
  carrello$ = this.carrelloSubject.asObservable();

  /**
   * Getter dinamico: recupera l'ID dell'utente dal Signal dell'AuthService.
   * Se l'utente non è loggato, restituisce 0 o null.
   */
  private get userId(): number {
    const utenteLoggato = this.auth.grant().utente;
    return utenteLoggato ? utenteLoggato.id : 0;
  }

  constructor() {
    // Carica il carrello all'avvio se l'utente è già loggato
    if (this.userId !== 0) {
      this.loadCarrello();
    }
  }

  /**
   * Recupera il carrello dal backend per l'utente corrente
   */
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

  /**
   * Aggiunge un prodotto al carrello (o aumenta la quantità se già presente)
   */
  aggiungi(idFormatoLibro: number): Observable<any> {
    const req = { 
      idUtente: this.userId, 
      idFormatoLibro: idFormatoLibro,
      quantita: 1 // Risolve l'errore Integer.intValue() null in Java
    };

    return this.http.post(`${this.API}/aggiungiProdotto`, req).pipe(
      tap(() => this.loadCarrello()) // Rinfresca i dati dopo l'operazione
    );
  }

  /**
   * Incrementa di 1 la quantità di un item specifico
   */
  aumenta(idItem: number): Observable<any> {
    return this.http.patch(`${this.API}/item/${idItem}/aumenta`, {}).pipe(
      tap(() => this.loadCarrello())
    );
  }

  /**
   * Decrementa di 1 la quantità di un item specifico
   */
  diminuisci(idItem: number): Observable<any> {
    return this.http.patch(`${this.API}/item/${idItem}/decrementa`, {}).pipe(
      tap(() => this.loadCarrello())
    );
  }

  /**
   * Rimuove completamente un item dal carrello
   */
  rimuovi(idItem: number): Observable<any> {
    return this.http.delete(`${this.API}/item/${idItem}/elimina`).pipe(
      tap(() => this.loadCarrello())
    );
  }

  /**
   * Sposta un prodotto dal carrello alla wishlist dell'utente
   */
  spostaInWishlist(idItem: number): Observable<any> {
    return this.http.post(`${this.API}/item/${idItem}/sposta-in-wishlist`, {}).pipe(
      tap(() => this.loadCarrello())
    );
  }

  /**
   * Svuota completamente il carrello dell'utente corrente
   */
  svuota(): Observable<any> {
    const id = this.userId;
    return this.http.delete(`${this.API}/svuota/${id}`).pipe(
      tap(() => {
        this.carrelloSubject.next(null); // Pulisce lo stato locale immediatamente
        console.log('Carrello svuotato.');
      })
    );
  }
}