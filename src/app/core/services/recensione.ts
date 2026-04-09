import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recensione, Resp } from '../models/models'; // Controlla il percorso dei modelli

@Injectable({
  providedIn: 'root'
})
export class RecensioneService {
  private apiUrl = 'http://localhost:8080/api/recensione';

  constructor(private http: HttpClient) {}

  // Recupera le recensioni per un libro specifico
  getByLibro(idLibro: number): Observable<Recensione[]> {
    const params = new HttpParams().set('idLibro', idLibro.toString());
    // Nota: il tuo backend restituisce un Object che è una List<RecensioneDTO>
    return this.http.get<Recensione[]>(`${this.apiUrl}/getByLibro`, { params });
  }

  // Invia una nuova recensione
  create(recensione: any): Observable<Resp> {
    return this.http.post<Resp>(`${this.apiUrl}/create`, recensione);
  }

  // Cancella una recensione
  delete(id: number): Observable<Resp> {
    const params = new HttpParams().set('id', id.toString());
    return this.http.delete<Resp>(`${this.apiUrl}/delete`, { params });
  }

}

export type { Recensione };
