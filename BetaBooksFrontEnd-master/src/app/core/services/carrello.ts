import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CarrelloItem, Libro } from '../models/models';

const USE_MOCK = true;

@Injectable({ providedIn: 'root' })
export class CarrelloService {

  private readonly API = 'http://localhost:8080/api/carrello';

  private itemsSubject = new BehaviorSubject<CarrelloItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getItems(): CarrelloItem[] {
    return this.itemsSubject.value;
  }

  aggiungi(libro: Libro): void {
    const items = [...this.itemsSubject.value];
    const esistente = items.find(i => i.libro.id === libro.id);
    if (esistente) {
      esistente.quantita++;
      esistente.prezzoPezzi = esistente.quantita * libro.prezzo;
    } else {
      items.push({
        id: Date.now(),
        idUtente: 1,
        libro,
        quantita: 1,
        prezzoPezzi: libro.prezzo
      });
    }
    this.itemsSubject.next(items);
  }

  rimuovi(libroId: number): void {
    this.itemsSubject.next(
      this.itemsSubject.value.filter(i => i.libro.id !== libroId)
    );
  }

  aggiornaQuantita(libroId: number, quantita: number): void {
    if (quantita <= 0) { this.rimuovi(libroId); return; }
    const items = this.itemsSubject.value.map(i =>
      i.libro.id === libroId
        ? { ...i, quantita, prezzoPezzi: quantita * i.libro.prezzo }
        : i
    );
    this.itemsSubject.next(items);
  }

  svuota(): void {
    this.itemsSubject.next([]);
  }

  getTotale(): number {
    return this.itemsSubject.value.reduce((acc, i) => acc + i.prezzoPezzi, 0);
  }

  getContatore(): number {
    return this.itemsSubject.value.reduce((acc, i) => acc + i.quantita, 0);
  }
}