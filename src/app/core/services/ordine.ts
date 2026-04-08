import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { OrdineDTO, MetodoPagamento, StatoOrdine, Resp, FiltroTemporale } from '../models/models';

@Injectable({ providedIn: 'root' })
export class OrdineService {
  private readonly API = 'http://localhost:8080/api/ordine';
  private http = inject(HttpClient);

  // GET /api/ordine/storico/{idUtente}
getOrdiniUtente(idUtente: number): Observable<OrdineDTO[]> {
    return this.http.get<Resp>(`${this.API}/storico/${idUtente}`).pipe(
      map((res: Resp) => (res.obj as any[]).map(o => this.arricchisciConTracking(o)))
    );
  }

  // POST /api/ordine/checkout?idUtente=...&metodo=...&idIndirizzo=...
  checkout(idUtente: number, metodo: MetodoPagamento, idIndirizzo: number): Observable<Resp> {
    const params = new HttpParams()
      .set('idUtente', idUtente.toString())
      .set('metodo', metodo)
      .set('idIndirizzo', idIndirizzo.toString());

    return this.http.post<Resp>(`${this.API}/checkout`, null, { params });
  }

  // GET /api/ordine/getById/{idOrdine}
getById(idOrdine: number): Observable<OrdineDTO> {
    return this.http.get<Resp>(`${this.API}/getById/${idOrdine}`).pipe(
      map((res: Resp) => this.arricchisciConTracking(res.obj as OrdineDTO))
    );
  }

  // PUT /api/ordine/annulla/{id}
  annulla(id: number): Observable<Resp> {
    return this.http.put<Resp>(`${this.API}/annulla/${id}`, {});
  }

  // PATCH /api/ordine/{id}/cambiaStato?nuovoStato=...
  aggiornaStato(id: number, nuovoStato: StatoOrdine): Observable<Resp> {
    const params = new HttpParams().set('nuovoStato', nuovoStato);
    return this.http.patch<Resp>(`${this.API}/${id}/cambiaStato`, null, { params });
  }

getOrdiniFiltrati(idUtente: number, completati: boolean, periodo: FiltroTemporale): Observable<OrdineDTO[]> {
    const params = new HttpParams()
      .set('completati', completati.toString())
      .set('periodo', periodo);

    return this.http.get<Resp>(`${this.API}/storico/${idUtente}/filtrato`, { params }).pipe(
      map((res: Resp) => (res.obj as any[]).map(o => this.arricchisciConTracking(o)))
    );
  }


// --- INTEGRAZIONE ALDO: Metodo per generare il tracking se manca dal DB ---
// Cambia il tipo di ritorno da OrdineDTO a any
private arricchisciConTracking(ordine: any): any { 
  if (ordine.tracking) return ordine;

  ordine.tracking = {
    codice: `BB-${ordine.id}-2026`,
    corriere: 'BetaExpress',
    stato: this.mappaStatoOrdineATracking(ordine.stato),
    ultimoAggiornamento: new Date().toISOString(),
    eventi: []
  };
  
  return ordine;
}

  private mappaStatoOrdineATracking(stato: StatoOrdine): string {
    switch (stato) {
      case StatoOrdine.IN_ATTESA: return 'PREPARAZIONE';
      case StatoOrdine.SPEDITO: return 'IN_TRANSITO';
      case StatoOrdine.CONSEGNATO: return 'CONSEGNATO';
      default: return 'PREPARAZIONE';
    }
  }
}