import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Ordine, StatoOrdine, MetodoPagamento } from '../models/models';

const MOCK_ORDINI: Ordine[] = [
  {
    id: 1,
    dataOrdine: '2025-03-01T10:30:00',
    stato: StatoOrdine.CONSEGNATO,
    totale: 27.80,
    idUtente: 1,
    metodoPagamento: MetodoPagamento.CARTA,
    items: [
      {
        id: 1,
        libro: {
          id: 1, titolo: 'Il Nome della Rosa', isbn: '978-8845292613',
          copertina: 'https://covers.openlibrary.org/b/isbn/9788845292613-L.jpg',
          prezzo: 14.90, quantita: 10, lingua: 'Italiano',
          autore: { id: 1, nome: 'Umberto', cognome: 'Eco' }
        },
        quantita: 1, prezzoUnitarioAcquisto: 14.90
      },
      {
        id: 2,
        libro: {
          id: 3, titolo: '1984', isbn: '978-8804668237',
          copertina: 'https://covers.openlibrary.org/b/isbn/9788804668237-L.jpg',
          prezzo: 11.50, quantita: 8, lingua: 'Italiano',
          autore: { id: 3, nome: 'George', cognome: 'Orwell' }
        },
        quantita: 1, prezzoUnitarioAcquisto: 11.50
      }
    ]
  },
  {
    id: 2,
    dataOrdine: '2025-03-10T15:00:00',
    stato: StatoOrdine.SPEDITO,
    totale: 12.90,
    idUtente: 1,
    metodoPagamento: MetodoPagamento.PAYPAL,
    items: [
      {
        id: 3,
        libro: {
          id: 2, titolo: 'Harry Potter e la Pietra Filosofale', isbn: '978-8877827593',
          copertina: 'https://covers.openlibrary.org/b/isbn/9788877827593-L.jpg',
          prezzo: 12.90, quantita: 25, lingua: 'Italiano',
          autore: { id: 2, nome: 'J.K.', cognome: 'Rowling' }
        },
        quantita: 1, prezzoUnitarioAcquisto: 12.90
      }
    ]
  },
  {
    id: 3,
    dataOrdine: '2025-03-17T09:00:00',
    stato: StatoOrdine.IN_ATTESA,
    totale: 31.00,
    idUtente: 1,
    metodoPagamento: MetodoPagamento.BONIFICO,
    items: [
      {
        id: 4,
        libro: {
          id: 7, titolo: 'Sapiens', isbn: '978-8858118191',
          copertina: 'https://covers.openlibrary.org/b/isbn/9788858118191-L.jpg',
          prezzo: 18.00, quantita: 10, lingua: 'Italiano',
          autore: { id: 7, nome: 'Yuval Noah', cognome: 'Harari' }
        },
        quantita: 1, prezzoUnitarioAcquisto: 18.00
      },
      {
        id: 5,
        libro: {
          id: 4, titolo: 'Il Piccolo Principe', isbn: '978-8845292613',
          copertina: 'https://covers.openlibrary.org/b/isbn/9782070408504-L.jpg',
          prezzo: 9.90, quantita: 30, lingua: 'Italiano',
          autore: { id: 4, nome: 'Antoine de', cognome: 'Saint-Exupéry' }
        },
        quantita: 1, prezzoUnitarioAcquisto: 9.90
      }
    ]
  }
];

const USE_MOCK = true;

@Injectable({ providedIn: 'root' })
export class OrdineService {

  private readonly API = 'http://localhost:8080/api/ordini';

  constructor(private http: HttpClient) {}

  getOrdiniUtente(): Observable<Ordine[]> {
    if (USE_MOCK) return of(MOCK_ORDINI);
    return this.http.get<Ordine[]>(`${this.API}/miei`);
  }

  getById(id: number): Observable<Ordine> {
    if (USE_MOCK) return of(MOCK_ORDINI.find(o => o.id === id)!);
    return this.http.get<Ordine>(`${this.API}/${id}`);
  }
}