import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Libro } from '../models/models';

const MOCK_LIBRI: Libro[] = [
  {
    id: 1, titolo: 'Il Nome della Rosa', isbn: '978-8845292613',
    copertina: 'https://covers.openlibrary.org/b/isbn/9788845292613-L.jpg',
    descrizione: 'Un celebre romanzo storico ambientato in un monastero medievale.',
    anno: 1980, lingua: 'Italiano', prezzo: 14.90, quantita: 12,
    autore: { id: 1, nome: 'Umberto', cognome: 'Eco' },
    editore: { id: 1, nome: 'Bompiani' },
    categorie: [{ id: 1, nome: 'Romanzo storico' }],
    valutazioneMedia: 4.7
  },
  {
    id: 2, titolo: 'Harry Potter e la Pietra Filosofale', isbn: '978-8877827593',
    copertina: 'https://covers.openlibrary.org/b/isbn/9788877827593-L.jpg',
    descrizione: 'Il primo capitolo della saga del giovane mago più famoso del mondo.',
    anno: 1997, lingua: 'Italiano', prezzo: 12.90, quantita: 25,
    autore: { id: 2, nome: 'J.K.', cognome: 'Rowling' },
    editore: { id: 2, nome: 'Salani' },
    categorie: [{ id: 2, nome: 'Fantasy' }],
    valutazioneMedia: 4.9
  },
  {
    id: 3, titolo: '1984', isbn: '978-8804668237',
    copertina: 'https://covers.openlibrary.org/b/isbn/9788804668237-L.jpg',
    descrizione: 'Un classico distopico sulla sorveglianza totale e il controllo del pensiero.',
    anno: 1949, lingua: 'Italiano', prezzo: 11.50, quantita: 8,
    autore: { id: 3, nome: 'George', cognome: 'Orwell' },
    editore: { id: 3, nome: 'Mondadori' },
    categorie: [{ id: 3, nome: 'Distopia' }],
    valutazioneMedia: 4.8
  },
  {
    id: 4, titolo: 'Il Piccolo Principe', isbn: '978-8845292613',
    copertina: 'https://covers.openlibrary.org/b/isbn/9782070408504-L.jpg',
    descrizione: 'Una storia poetica e filosofica amata da grandi e piccini.',
    anno: 1943, lingua: 'Italiano', prezzo: 9.90, quantita: 30,
    autore: { id: 4, nome: 'Antoine de', cognome: 'Saint-Exupéry' },
    editore: { id: 4, nome: 'Bompiani' },
    categorie: [{ id: 4, nome: 'Classici' }],
    valutazioneMedia: 4.6
  },
  {
    id: 5, titolo: 'La Divina Commedia', isbn: '978-8804701705',
    copertina: 'https://covers.openlibrary.org/b/isbn/9788804701705-L.jpg',
    descrizione: 'Il capolavoro assoluto della letteratura italiana.',
    anno: 1320, lingua: 'Italiano', prezzo: 16.00, quantita: 5,
    autore: { id: 5, nome: 'Dante', cognome: 'Alighieri' },
    editore: { id: 5, nome: 'Mondadori' },
    categorie: [{ id: 4, nome: 'Classici' }],
    valutazioneMedia: 4.5
  },
  {
    id: 6, titolo: 'Il Codice Da Vinci', isbn: '978-8804531012',
    copertina: 'https://covers.openlibrary.org/b/isbn/9788804531012-L.jpg',
    descrizione: 'Un thriller avvincente tra arte, storia e misteri.',
    anno: 2003, lingua: 'Italiano', prezzo: 13.50, quantita: 15,
    autore: { id: 6, nome: 'Dan', cognome: 'Brown' },
    editore: { id: 5, nome: 'Mondadori' },
    categorie: [{ id: 5, nome: 'Thriller' }],
    valutazioneMedia: 4.2
  },
  {
    id: 7, titolo: 'Sapiens', isbn: '978-8858118191',
    copertina: 'https://covers.openlibrary.org/b/isbn/9788858118191-L.jpg',
    descrizione: "Breve storia dell'umanità dal Big Bang al futuro.",
    anno: 2011, lingua: 'Italiano', prezzo: 18.00, quantita: 10,
    autore: { id: 7, nome: 'Yuval Noah', cognome: 'Harari' },
    editore: { id: 6, nome: 'Bompiani' },
    categorie: [{ id: 6, nome: 'Saggistica' }],
    valutazioneMedia: 4.6
  },
  {
    id: 8, titolo: 'Lo Hobbit', isbn: '978-8845298318',
    copertina: 'https://covers.openlibrary.org/b/isbn/9788845298318-L.jpg',
    descrizione: "Un'avventura epica nella Terra di Mezzo.",
    anno: 1937, lingua: 'Italiano', prezzo: 13.00, quantita: 18,
    autore: { id: 8, nome: 'J.R.R.', cognome: 'Tolkien' },
    editore: { id: 7, nome: 'Bompiani' },
    categorie: [{ id: 2, nome: 'Fantasy' }],
    valutazioneMedia: 4.8
  }
];

const USE_MOCK = true;

@Injectable({ providedIn: 'root' })
export class LibroService {

  private readonly API = 'http://localhost:8080/api/libri';
  private miPiaceKey = 'betabooks_mi_piace';
  private miPiaceSet = new Set<number>();

  constructor(private http: HttpClient) {
    this.loadMiPiace();
  }

  private loadMiPiace(): void {
    const saved = localStorage.getItem(this.miPiaceKey);
    if (saved) {
      const ids = JSON.parse(saved);
      this.miPiaceSet = new Set(ids);
    }
  }

  private saveMiPiace(): void {
    localStorage.setItem(this.miPiaceKey, JSON.stringify(Array.from(this.miPiaceSet)));
  }

  isMiPiace(libroId: number): boolean {
    return this.miPiaceSet.has(libroId);
  }

  toggleMiPiace(libroId: number): void {
    if (this.miPiaceSet.has(libroId)) {
      this.miPiaceSet.delete(libroId);
    } else {
      this.miPiaceSet.add(libroId);
    }
    this.saveMiPiace();
  }

  getAll(): Observable<Libro[]> {
    if (USE_MOCK) {
      const libriConMiPiace = MOCK_LIBRI.map(l => ({
        ...l,
        miPiace: this.isMiPiace(l.id)
      }));
      return of(libriConMiPiace);
    }
    return this.http.get<Libro[]>(this.API);
  }

  getById(id: number): Observable<Libro> {
    if (USE_MOCK) {
      const libro = MOCK_LIBRI.find(l => l.id === id);
      if (!libro) return of(null as any);
      return of({
        ...libro,
        miPiace: this.isMiPiace(libro.id)
      });
    }
    return this.http.get<Libro>(`${this.API}/${id}`);
  }

  cerca(query: string): Observable<Libro[]> {
    if (USE_MOCK) {
      const q = query.toLowerCase();
      const libriConMiPiace = MOCK_LIBRI
        .filter(l =>
          l.titolo.toLowerCase().includes(q) ||
          l.autore.cognome.toLowerCase().includes(q) ||
          l.autore.nome.toLowerCase().includes(q)
        )
        .map(l => ({
          ...l,
          miPiace: this.isMiPiace(l.id)
        }));
      return of(libriConMiPiace);
    }
    return this.http.get<Libro[]>(`${this.API}/search?q=${query}`);
  }
}