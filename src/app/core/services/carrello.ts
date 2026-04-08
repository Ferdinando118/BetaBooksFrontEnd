import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { CarrelloItem, Libro, TipoEdizione } from '../models/models';

const USE_MOCK = true;

@Injectable({ providedIn: 'root' })
export class CarrelloService {

  private readonly API = 'http://localhost:8080/api/carrello';
  private readonly STORAGE_KEY = 'betabooks.cart';

  private itemsSubject = new BehaviorSubject<CarrelloItem[]>(this.loadFromStorage());
  items$ = this.itemsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getItems(): CarrelloItem[] {
    return this.itemsSubject.value;
  }

  aggiungi(
    libro: Libro,
    edizione: TipoEdizione = TipoEdizione.COPERTINA_FLESSIBILE
  ): void {
    const prezzo = this.getPrezzoEdizione(libro, edizione);
    if (!Number.isFinite(prezzo) || prezzo <= 0) return;

    const items = [...this.itemsSubject.value];
    const esistente = items.find(i => i.libro.id === libro.id && i.edizione === edizione);

    if (esistente) {
      esistente.quantita++;
      esistente.prezzoPezzi = esistente.quantita * prezzo;
    } else {
      items.push({
        id: Date.now(),
        idUtente: 1,
        libro,
        edizione,
        quantita: 1,
        prezzoPezzi: prezzo
      });
    }

    this.setItems(items);
  }

  rimuovi(itemId: number): void {
    this.setItems(this.itemsSubject.value.filter(i => i.id !== itemId));
  }

  aggiornaQuantita(itemId: number, quantita: number): void {
    const q = this.toValidQuantity(quantita);
    if (q <= 0) { this.rimuovi(itemId); return; }

    const items = this.itemsSubject.value.map(i => {
      if (i.id !== itemId) return i;
      const prezzo = this.getPrezzoEdizione(i.libro, i.edizione);
      return { ...i, quantita: q, prezzoPezzi: q * prezzo };
    });

    this.setItems(items);
  }

  cambiaEdizione(itemId: number, nuovaEdizione: TipoEdizione): void {
    const items = [...this.itemsSubject.value];
    const idx = items.findIndex(i => i.id === itemId);
    if (idx < 0) return;

    const corrente = items[idx];
    if (corrente.edizione === nuovaEdizione) return;

    const targetIdx = items.findIndex(
      (i) => i.libro.id === corrente.libro.id && i.edizione === nuovaEdizione
    );

    if (targetIdx >= 0) {
      const target = items[targetIdx];
      target.quantita += corrente.quantita;
      target.prezzoPezzi = target.quantita * this.getPrezzoEdizione(target.libro, nuovaEdizione);
      items.splice(idx, 1);
      this.setItems(items);
      return;
    }

    items[idx] = {
      ...corrente,
      edizione: nuovaEdizione,
      prezzoPezzi: corrente.quantita * this.getPrezzoEdizione(corrente.libro, nuovaEdizione)
    };

    this.setItems(items);
  }

  svuota(): void {
    this.setItems([]);
  }

  getTotale(): number {
    return this.itemsSubject.value.reduce((acc, i) => acc + i.prezzoPezzi, 0);
  }

  getContatore(): number {
    return this.itemsSubject.value.reduce((acc, i) => acc + i.quantita, 0);
  }

  private setItems(items: CarrelloItem[]): void {
    const safe = this.sanitizeItems(items);
    this.itemsSubject.next(safe);
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(safe));
    } catch {
      // Se localStorage non e' accessibile, manteniamo almeno lo stato in memoria.
    }
  }

  private loadFromStorage(): CarrelloItem[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw) as CarrelloItem[];
      return Array.isArray(parsed) ? this.sanitizeItems(parsed) : [];
    } catch {
      return [];
    }
  }

  private toValidQuantity(quantita: number): number {
    if (!Number.isFinite(quantita)) return 0;
    return Math.trunc(quantita);
  }

  private sanitizeItems(items: CarrelloItem[]): CarrelloItem[] {
    return items
      .map((i) => {
        if (!i || !i.libro) return null;

        const q = this.toValidQuantity(i.quantita);
        if (q <= 0) return null;

        const edizione =
          (i as Partial<CarrelloItem>).edizione ?? TipoEdizione.COPERTINA_FLESSIBILE;
        const prezzo = this.getPrezzoEdizione(i.libro, edizione);
        if (!Number.isFinite(prezzo) || prezzo <= 0) return null;

        return {
          ...i,
          idUtente: 1,
          edizione,
          quantita: q,
          prezzoPezzi: q * prezzo
        } as CarrelloItem;
      })
      .filter((x): x is CarrelloItem => x !== null);
  }

  public getPrezzoEdizione(libro: Libro, edizione: TipoEdizione): number {
    const base = Number(libro.prezzo);
    if (!Number.isFinite(base)) return 0;

    // Prezzi demo derivati dal prezzo base del libro.
    switch (edizione) {
      case TipoEdizione.COPERTINA_RIGIDA:
        return Math.round(base * 1.3 * 100) / 100;
      case TipoEdizione.EBOOK:
        return Math.round(base * 0.4 * 100) / 100;
      case TipoEdizione.COPERTINA_FLESSIBILE:
      default:
        return base;
    }
  }
}