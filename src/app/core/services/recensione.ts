import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recensione, Resp } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class RecensioneService {
  private apiUrl = 'http://localhost:8080/api/recensione';

  constructor(private http: HttpClient) {}

 
  getByLibro(idLibro: number): Observable<Recensione[]> {
    const params = new HttpParams().set('idLibro', idLibro.toString());
    return this.http.get<Recensione[]>(`${this.apiUrl}/getByLibro`, { params });
  }


  create(recensione: any): Observable<Resp> {
    return this.http.post<Resp>(`${this.apiUrl}/create`, recensione);
  }

 
  delete(id: number): Observable<Resp> {
    const params = new HttpParams().set('id', id.toString());
    return this.http.delete<Resp>(`${this.apiUrl}/delete`, { params });
  }

  update(req: any): Observable<any> {
    return this.http.put<any>(`http://localhost:8080/api/recensione/update`, req);
  }

  getByProfilo(idProfilo: number): Observable<Recensione[]> {
    const params = new HttpParams().set('idProfilo', idProfilo.toString());
    return this.http.get<Recensione[]>(`${this.apiUrl}/getByProfilo`, { params });
  }

} 

