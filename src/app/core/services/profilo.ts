import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProfiloUtente, Indirizzo } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProfiloService {
  private readonly API_PROFILI = 'http://localhost:8080/api/profili';
  private readonly API_INDIRIZZI = 'http://localhost:8080/api/indirizzi';

  constructor(private http: HttpClient) {}

  findByUtente(idUtente: number): Observable<ProfiloUtente> {
    return this.http.get<ProfiloUtente>(`${this.API_PROFILI}/utente/${idUtente}`);
  }

  saveProfilo(profilo: ProfiloUtente): Observable<any> {
    if (profilo.id) {
      // È una modifica (PUT): Diciamo ad Angular di non cercare un JSON
      return this.http.put(`${this.API_PROFILI}/${profilo.id}`, profilo, { responseType: 'text' });
    } else {
      // È una creazione (POST)
      return this.http.post(this.API_PROFILI, profilo);
    }
  }

  findIndirizziByUser(idUtente: number): Observable<Indirizzo[]> {
    return this.http.get<Indirizzo[]>(`${this.API_INDIRIZZI}/user/${idUtente}`);
  }

  saveIndirizzo(indirizzo: Indirizzo): Observable<any> {
    if (indirizzo.id) {
      // È una modifica (PUT): Diciamo ad Angular di non cercare un JSON
      return this.http.put(`${this.API_INDIRIZZI}/${indirizzo.id}`, indirizzo, { responseType: 'text' });
    } else {
      // È una creazione (POST)
      return this.http.post(this.API_INDIRIZZI, indirizzo);
    }
  }

  deleteIndirizzo(id: number): Observable<any> {
    // È un'eliminazione (DELETE): Java restituirà 204 No Content
    return this.http.delete(`${this.API_INDIRIZZI}/${id}`, { responseType: 'text' });
  }
}