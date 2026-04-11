import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditLogDTO } from '../models/models'; 

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private readonly API = 'http://localhost:8080/api/audit';

  constructor(private http: HttpClient) {}

  // Recupera tutti i log
  findAll(): Observable<AuditLogDTO[]> {
    return this.http.get<AuditLogDTO[]>(`${this.API}/getAll`);
  }

  // Recupera log filtrati per nome tabella
  findByTabella(nomeTabella: string): Observable<AuditLogDTO[]> {
    return this.http.get<AuditLogDTO[]>(`${this.API}/getByTabella`, {
      params: { nomeTabella }
    });
  }
}