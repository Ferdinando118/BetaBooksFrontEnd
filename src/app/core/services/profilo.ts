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
    return this.http.get<ProfiloUtente>(`${this.API_PROFILI}/utente/${idUtente}`, { withCredentials: true });
  }

  saveProfilo(profilo: ProfiloUtente): Observable<any> {
   
    const options = { withCredentials: true, responseType: 'text' as 'json' };

    if (profilo.id) {
    
      return this.http.put(`${this.API_PROFILI}/${profilo.id}`, profilo, options);
    } else {
      return this.http.post(this.API_PROFILI, profilo, { withCredentials: true });
    }
  }

  
  findIndirizziByUser(idUtente: number): Observable<Indirizzo[]> {
    return this.http.get<Indirizzo[]>(`${this.API_INDIRIZZI}/user/${idUtente}`, { withCredentials: true });
  }

  saveIndirizzo(indirizzo: Indirizzo): Observable<any> {
    const options = { withCredentials: true, responseType: 'text' as 'json' };

    if (indirizzo.id) {
      
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