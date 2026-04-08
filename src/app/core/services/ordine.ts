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
/*
private arricchisciConTracking(ordine: any): any { 

  console.log('tracking dal server:', ordine.tracking, '| stato:', ordine.stato);
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
  }*/

  private arricchisciConTracking(ordine: any): any {
  // Controlla che tracking esista E abbia un codice valido
  if (ordine.tracking?.codice) return ordine;

  ordine.tracking = {
    codice: `BB-${ordine.id}-2026`,
    corriere: 'BetaExpress',
    stato: this.mappaStatoOrdineATracking(ordine.stato),
    ultimoAggiornamento: new Date().toISOString(),
    eventi: this.generaEventi(ordine.stato) // ← vedi sotto
  };
  return ordine;
}

// Genera eventi fake coerenti con lo stato
private generaEventi(stato: string): any[] {
  const base = [{ 
    timestamp: new Date().toISOString(), 
    stato: 'PREPARAZIONE', 
    descrizione: 'Ordine ricevuto e in preparazione' 
  }];
  if (stato === 'SPEDITO' || stato === 'CONSEGNATO') {
    base.push({ 
      timestamp: new Date().toISOString(), 
      stato: 'IN_TRANSITO', 
      descrizione: 'Pacco affidato al corriere' 
    });
  }
  if (stato === 'CONSEGNATO') {
    base.push({ 
      timestamp: new Date().toISOString(), 
      stato: 'CONSEGNATO', 
      descrizione: 'Pacco consegnato' 
    });
  }
  return base;
}

private mappaStatoOrdineATracking(stato: string): string {
  // Usa stringa diretta, non enum — il server manda stringhe
  switch (stato?.toUpperCase()) {
    case 'IN_ATTESA':  return 'PREPARAZIONE';
    case 'SPEDITO':    return 'IN_TRANSITO';
    case 'CONSEGNATO': return 'CONSEGNATO';
    default:           return 'PREPARAZIONE';
  }
}


}