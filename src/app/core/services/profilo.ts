import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProfiloUtente, Indirizzo } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProfiloService {
  private readonly API_PROFILI = 'http://localhost:8080/api/profili';
  private readonly API_INDIRIZZI = 'http://localhost:8080/api/indirizzi';

  constructor(private http: HttpClient) {}

  // 1. GET con withCredentials
  findByUtente(idUtente: number): Observable<ProfiloUtente> {
    return this.http.get<ProfiloUtente>(`${this.API_PROFILI}/utente/${idUtente}`, { withCredentials: true });
  }

  saveProfilo(profilo: ProfiloUtente): Observable<any> {
    // Definiamo le opzioni complete
    const options = { withCredentials: true, responseType: 'text' as 'json' };

    if (profilo.id) {
      // USIAMO 'options' qui
      return this.http.put(`${this.API_PROFILI}/${profilo.id}`, profilo, options);
    } else {
      return this.http.post(this.API_PROFILI, profilo, { withCredentials: true });
    }
  }

  // 2. GET con withCredentials
  findIndirizziByUser(idUtente: number): Observable<Indirizzo[]> {
    return this.http.get<Indirizzo[]>(`${this.API_INDIRIZZI}/user/${idUtente}`, { withCredentials: true });
  }

  saveIndirizzo(indirizzo: Indirizzo): Observable<any> {
    const options = { withCredentials: true, responseType: 'text' as 'json' };

    if (indirizzo.id) {
      // USIAMO 'options' qui
      return this.http.put(`${this.API_INDIRIZZI}/${indirizzo.id}`, indirizzo, options);
    } else {
      return this.http.post(this.API_INDIRIZZI, indirizzo, { withCredentials: true });
    }
  }

  deleteIndirizzo(id: number): Observable<any> {
    return this.http.delete(`${this.API_INDIRIZZI}/${id}`, { 
      withCredentials: true, 
      responseType: 'text' 
    });
  }

  
}