import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, of } from 'rxjs';
import {
  CarrelloItem,
  Indirizzo,
  MetodoPagamento,
  TipoEdizione,
  TipoSpedizione,
  Ordine,
  StatoOrdine,
  StatoTracking,
  TrackingSpedizione
} from '../models/models';

const MOCK_ORDINI: Ordine[] = [
  {
    id: 1,
    dataOrdine: '2025-03-01T10:30:00',
    stato: StatoOrdine.CONSEGNATO,
    totale: 27.80,
    idUtente: 1,
    metodoPagamento: MetodoPagamento.CARTA,
    tipoSpedizione: TipoSpedizione.STANDARD,
    tracking: {
      codice: 'BBIT1001',
      corriere: 'BetaExpress',
      stato: StatoTracking.CONSEGNATO,
      ultimoAggiornamento: '2025-03-02T14:10:00',
      eventi: [
        {
          timestamp: '2025-03-01T12:10:00',
          stato: StatoTracking.PREPARAZIONE,
          descrizione: 'Ordine in preparazione in magazzino'
        },
        {
          timestamp: '2025-03-01T17:00:00',
          stato: StatoTracking.RITIRO_CORRIERE,
          descrizione: 'Pacco ritirato dal corriere'
        },
        {
          timestamp: '2025-03-02T08:20:00',
          stato: StatoTracking.IN_TRANSITO,
          descrizione: 'Pacco in transito'
        },
        {
          timestamp: '2025-03-02T11:35:00',
          stato: StatoTracking.IN_CONSEGNA,
          descrizione: 'Corriere in consegna'
        },
        {
          timestamp: '2025-03-02T14:10:00',
          stato: StatoTracking.CONSEGNATO,
          descrizione: 'Ordine consegnato'
        }
      ]
    },
    items: [
      {
        id: 1,
        libro: {
          id: 1, titolo: 'Il Nome della Rosa', isbn: '978-8845292613',
          copertina: 'https://covers.openlibrary.org/b/isbn/9788845292613-L.jpg',
          prezzo: 14.90, quantita: 10, lingua: 'Italiano',
          autore: { id: 1, nome: 'Umberto', cognome: 'Eco' }
        },
        edizione: TipoEdizione.COPERTINA_FLESSIBILE,
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
        edizione: TipoEdizione.COPERTINA_FLESSIBILE,
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
    tipoSpedizione: TipoSpedizione.ESPRESSA,
    tracking: {
      codice: 'BBIT1002',
      corriere: 'BetaExpress',
      stato: StatoTracking.IN_TRANSITO,
      ultimoAggiornamento: '2025-03-12T10:20:00',
      eventi: [
        {
          timestamp: '2025-03-10T17:00:00',
          stato: StatoTracking.RITIRO_CORRIERE,
          descrizione: 'Pacco preso in carico dal corriere'
        },
        {
          timestamp: '2025-03-11T08:30:00',
          stato: StatoTracking.IN_TRANSITO,
          descrizione: 'Pacco in transito verso il centro locale'
        }
      ]
    },
    items: [
      {
        id: 3,
        libro: {
          id: 2, titolo: 'Harry Potter e la Pietra Filosofale', isbn: '978-8877827593',
          copertina: 'https://covers.openlibrary.org/b/isbn/9788877827593-L.jpg',
          prezzo: 12.90, quantita: 25, lingua: 'Italiano',
          autore: { id: 2, nome: 'J.K.', cognome: 'Rowling' }
        },
        edizione: TipoEdizione.COPERTINA_FLESSIBILE,
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
    tipoSpedizione: TipoSpedizione.PROGRAMMATA,
    tracking: {
      codice: 'BBIT1003',
      corriere: 'BetaDelivery',
      stato: StatoTracking.PREPARAZIONE,
      ultimoAggiornamento: '2025-03-17T09:15:00',
      eventi: [
        {
          timestamp: '2025-03-17T09:15:00',
          stato: StatoTracking.PREPARAZIONE,
          descrizione: 'Ordine in preparazione in magazzino'
        }
      ]
    },
    items: [
      {
        id: 4,
        libro: {
          id: 7, titolo: 'Sapiens', isbn: '978-8858118191',
          copertina: 'https://covers.openlibrary.org/b/isbn/9788858118191-L.jpg',
          prezzo: 18.00, quantita: 10, lingua: 'Italiano',
          autore: { id: 7, nome: 'Yuval Noah', cognome: 'Harari' }
        },
        edizione: TipoEdizione.COPERTINA_FLESSIBILE,
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
        edizione: TipoEdizione.COPERTINA_FLESSIBILE,
        quantita: 1, prezzoUnitarioAcquisto: 9.90
      }
    ]
  }
];

const USE_MOCK = true;

@Injectable({ providedIn: 'root' })
export class OrdineService {

  private readonly API = 'http://localhost:8080/api/ordini';
  private readonly trackingSteps: StatoTracking[] = [
    StatoTracking.PREPARAZIONE,
    StatoTracking.RITIRO_CORRIERE,
    StatoTracking.IN_TRANSITO,
    StatoTracking.IN_CONSEGNA,
    StatoTracking.CONSEGNATO
  ];
  private ordiniSubject = new BehaviorSubject<Ordine[]>(this.clonaOrdini(MOCK_ORDINI));

  constructor(private http: HttpClient) {
    if (USE_MOCK) {
      this.startTrackingSimulation();
    }
  }

  getOrdiniUtente(): Observable<Ordine[]> {
    if (USE_MOCK) return this.ordiniSubject.asObservable();
    return this.http.get<Ordine[]>(`${this.API}/miei`);
  }

  getById(id: number): Observable<Ordine> {
    if (USE_MOCK) return of(this.ordiniSubject.value.find(o => o.id === id)!);
    return this.http.get<Ordine>(`${this.API}/${id}`);
  }

  creaOrdineDaCarrello(
    items: CarrelloItem[],
    metodoPagamento: MetodoPagamento,
    indirizzo?: Indirizzo,
    tipoSpedizione?: TipoSpedizione
  ): Observable<Ordine> {
    const totale = items.reduce((acc, item) => acc + item.prezzoPezzi, 0);
    // In assenza di scelta UI, assegniamo un tipo coerente col metodo pagamento.
    const effectiveTipoSpedizione =
      tipoSpedizione ?? this.tipoSpedizioneDaMetodoPagamento(metodoPagamento);
    const nuovoOrdine: Ordine = {
      id: this.getNextOrderId(),
      dataOrdine: new Date().toISOString(),
      stato: StatoOrdine.IN_ATTESA,
      totale,
      idUtente: 1,
      metodoPagamento,
      tipoSpedizione: effectiveTipoSpedizione,
      indirizzo,
      tracking: this.createTracking(effectiveTipoSpedizione),
      items: items.map((item, index) => ({
        id: index + 1,
        libro: item.libro,
        edizione: item.edizione,
        quantita: item.quantita,
        prezzoUnitarioAcquisto: item.prezzoPezzi / item.quantita
      }))
    };

    if (USE_MOCK) {
      this.ordiniSubject.next([nuovoOrdine, ...this.ordiniSubject.value]);
      return of(nuovoOrdine);
    }

    return this.http.post<Ordine>(this.API, nuovoOrdine);
  }

  private startTrackingSimulation(): void {
    interval(8000).subscribe(() => {
      const updated = this.ordiniSubject.value.map((ordine) => this.advanceTracking(ordine));
      this.ordiniSubject.next(updated);
    });
  }

  private advanceTracking(ordine: Ordine): Ordine {
    if (!ordine.tracking) {
      return ordine;
    }

    const idx = this.trackingSteps.indexOf(ordine.tracking.stato);
    if (idx < 0 || idx >= this.trackingSteps.length - 1) {
      return ordine;
    }

    // Avanza solo alcuni ordini per simulare aggiornamenti real-time non simultanei.
    if (Math.random() < 0.55) {
      return ordine;
    }

    const nextState = this.trackingSteps[idx + 1];
    const timestamp = new Date().toISOString();
    const tracking: TrackingSpedizione = {
      ...ordine.tracking,
      stato: nextState,
      ultimoAggiornamento: timestamp,
      eventi: [
        ...ordine.tracking.eventi,
        {
          timestamp,
          stato: nextState,
          descrizione: this.getTrackingDescription(nextState)
        }
      ]
    };

    const statoOrdine = nextState === StatoTracking.CONSEGNATO ? StatoOrdine.CONSEGNATO : StatoOrdine.SPEDITO;
    return { ...ordine, tracking, stato: statoOrdine };
  }

  private getTrackingDescription(stato: StatoTracking): string {
    return ({
      [StatoTracking.PREPARAZIONE]: 'Ordine in preparazione in magazzino',
      [StatoTracking.RITIRO_CORRIERE]: 'Pacco ritirato dal corriere',
      [StatoTracking.IN_TRANSITO]: 'Pacco in transito',
      [StatoTracking.IN_CONSEGNA]: 'Corriere in consegna',
      [StatoTracking.CONSEGNATO]: 'Ordine consegnato'
    })[stato];
  }

  private createTracking(tipoSpedizione: TipoSpedizione): TrackingSpedizione {
    const timestamp = new Date().toISOString();
    const corriere =
      tipoSpedizione === TipoSpedizione.ESPRESSA
        ? 'BetaExpress'
        : tipoSpedizione === TipoSpedizione.PROGRAMMATA
          ? 'BetaDelivery'
          : 'BetaExpress';

    return {
      codice: `BBIT${Date.now().toString().slice(-6)}`,
      corriere,
      stato: StatoTracking.PREPARAZIONE,
      ultimoAggiornamento: timestamp,
      eventi: [{
        timestamp,
        stato: StatoTracking.PREPARAZIONE,
        descrizione: this.getTrackingDescription(StatoTracking.PREPARAZIONE)
      }]
    };
  }

  private tipoSpedizioneDaMetodoPagamento(metodoPagamento: MetodoPagamento): TipoSpedizione {
    switch (metodoPagamento) {
      case MetodoPagamento.CARTA:
        return TipoSpedizione.STANDARD;
      case MetodoPagamento.PAYPAL:
        return TipoSpedizione.ESPRESSA;
      case MetodoPagamento.CONSEGNA:
        return TipoSpedizione.STANDARD;
      case MetodoPagamento.BONIFICO:
        return TipoSpedizione.PROGRAMMATA;
      default:
        return TipoSpedizione.STANDARD;
    }
  }

  private getNextOrderId(): number {
    return Math.max(0, ...this.ordiniSubject.value.map(o => o.id)) + 1;
  }

  private clonaOrdini(ordini: Ordine[]): Ordine[] {
    return structuredClone(ordini);
  }
}