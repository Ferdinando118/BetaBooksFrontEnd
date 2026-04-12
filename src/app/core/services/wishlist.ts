import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private url = 'http://localhost:8080/api/wishlist';
  private http = inject(HttpClient);

  toggle(userId: number, formatId: number, isCurrentlyInWishlist: boolean): Observable<any> {
    const params = new HttpParams().set('userId', userId).set('formatId', formatId);
    
    if (isCurrentlyInWishlist) {
      return this.http.delete(`${this.url}/rimuovi`, { params });
    } else {
      return this.http.post(`${this.url}/aggiungi`, null, { params });
    }
  }

  getWishlist(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/utente/${userId}`);
  }

  checkStatus(userId: number, formatId: number): Observable<boolean> {
    const params = new HttpParams().set('userId', userId).set('formatId', formatId);
    return this.http.get<boolean>(`${this.url}/controlla`, { params });
  }
}