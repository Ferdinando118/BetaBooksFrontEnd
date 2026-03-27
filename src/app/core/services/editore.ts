import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EditoreService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/editore';

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/getAll`);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/getById?id=${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post(`${this.url}/create`, data);
  }
}