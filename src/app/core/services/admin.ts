import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ordine } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private readonly API_ADMIN = 'http://localhost:8080/api/admin';


  getTuttiOrdini(): Observable<Ordine[]> {
    return this.http.get<Ordine[]>(`${this.API_ADMIN}/ordini`);
  }


  aggiornaStato(ordineId: number, nuovoStato: string, tracking?: {corriere: string, codice: string}): Observable<any> {
    return this.http.post(`${this.API_ADMIN}/ordini/${ordineId}/stato`, { 
      stato: nuovoStato,
      ...tracking 
    });
  }
}
