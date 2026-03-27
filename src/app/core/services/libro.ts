import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { LibroDTO} from '../models/libro.model';

export interface LibroReq {
  id?: number;
  titolo: string;
  descrizione?: string;
  idAutore: number;
  idEditore: number;
  idCategorie?: number[];
  // Aggiungi questi campi per matchare la classe Java LibroReq
  tipoSupporto: string;
  tipoCopertina: string;
  isbn?: string;
  prezzo: number;
  quantita: number;
}

export interface FormatoLibroReq {
  id?: number;
  idLibro: number;            // Corretto da id_libro
  tipoSupporto: string;       // Sostituisce 'formato'
  tipoCopertina: string;      // Aggiunto per matchare il backend
  isbn?: string;              // Aggiunto per matchare il backend
  prezzo: number;
  quantita: number;           // Sostituisce 'stock'
  attivo?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LibroService {
  private url = 'http://localhost:8080/api/libro';

  libri = signal<any[]>([]);

  constructor(private http: HttpClient) {}

  // ─── LIBRO ───────────────────────────────────────────

  getAll() {
    return this.http.get<any[]>(`${this.url}/getAll`).pipe(
      tap(data => this.libri.set(data))
    );
  }

  getById(id: number) {
    const params = new HttpParams().set('id', id);
    return this.http.get<any>(`${this.url}/getById`, { params });
  }

  create(body: LibroReq) {
    return this.http.post<any>(`${this.url}/create`, body).pipe(
      tap(() => this.getAll().subscribe())
    );
  }

  update(body: LibroReq) {
    return this.http.put<any>(`${this.url}/update`, body).pipe(
      tap(() => this.getAll().subscribe())
    );
  }

  // ─── FORMATO ─────────────────────────────────────────

createFormato(idLibro: number, body: any) {
  return this.http.post<any>(`${this.url}/formato/create/${idLibro}`, body);
}
  
  updateFormato(body: FormatoLibroReq) {
    return this.http.put<any>(`${this.url}/formato/update`, body);
  }

  disattivaFormato(id: number) {
    return this.http.put<any>(`${this.url}/formato/disattiva/${id}`, null);
  }

  getFormatiByLibro(idLibro: number) {
    const params = new HttpParams().set('idLibro', idLibro);
    return this.http.get<any>(`${this.url}/formato/getByLibro`, { params });
  }

  getFormatoById(id: number) {
    const params = new HttpParams().set('id', id);
    return this.http.get<any>(`${this.url}/formato/getById`, { params });
  }

  getFormatoCompleto(id: number) {
    const params = new HttpParams().set('id', id);
    return this.http.get<any>(`${this.url}/formato/getCompleto`, { params });
  }

  // ─── COPERTINA (multipart) ────────────────────────────

// libro.service.ts
uploadCopertina(idFormato: number, file: File) {
  const formData = new FormData();
  formData.append('file', file); // Il nome 'file' deve coincidere con @RequestPart("file") in Java
  return this.http.post<any>(`${this.url}/formato/copertina/${idFormato}`, formData);
}
}