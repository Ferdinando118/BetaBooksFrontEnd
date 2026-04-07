import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LibroService } from '../../../../core/services/libro';
import { CarrelloService } from '../../../../core/services/carrello';
import { AuthService } from '../../../../core/services/auth';
import { LibroDTO } from '../../../../core/models/libro.model';

@Component({
  selector: 'app-catalogo',
  standalone: false,
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class Catalogo implements OnInit {
  public readonly auth = inject(AuthService);
  private readonly libroService = inject(LibroService);
  private readonly carrelloService = inject(CarrelloService);

  // --- Signals per lo Stato ---
  libri = signal<any[]>([]);
  categorie = signal<string[]>([]);
  loading = signal(true);

  // --- Filtri ---
  ricerca = '';
  categoriaSelezionata = '';
  ordinamento = 'titolo';

  libriFiltrati = computed(() => {
    let risultati = [...this.libri()];

// catalogo.ts - dentro libriFiltrati
if (this.ricerca.trim()) {
  const query = this.ricerca.toLowerCase();
  risultati = risultati.filter(l =>
    l.titolo?.toLowerCase().includes(query) ||
    l.autore?.nome?.toLowerCase().includes(query) ||
    l.autore?.cognome?.toLowerCase().includes(query) ||
    l.editore?.nome?.toLowerCase().includes(query) // Aggiungi questo per l'editore!
  );
}

    if (this.categoriaSelezionata) {
      risultati = risultati.filter(l =>
        l.categorie?.some((c: any) => c.nome === this.categoriaSelezionata)
      );
    }

    switch (this.ordinamento) {
      case 'prezzo-asc':  risultati.sort((a, b) => (a.prezzo || 0) - (b.prezzo || 0)); break;
      case 'prezzo-desc': risultati.sort((a, b) => (b.prezzo || 0) - (a.prezzo || 0)); break;
      default:            risultati.sort((a, b) => a.titolo?.localeCompare(b.titolo));
    }

    return risultati;
  });

  ngOnInit(): void {
    this.inizializzaCatalogo();
  }

  private inizializzaCatalogo(): void {
    this.loading.set(true);
    this.libroService.getAll().subscribe({
      next: (data: LibroDTO[]) => {
        const mappati = data.map(libro => {
          const f = libro.formati?.[0];
          
          // Costruzione URL immagine
          const urlServer = 'http://localhost:8080/uploads/'; 
          // Se f.copertina è già un URL (http...) lo usiamo, altrimenti aggiungiamo il prefisso
          const copertinaUrl = f?.copertina 
            ? (f.copertina.startsWith('http') ? f.copertina : urlServer + f.copertina) 
            : 'images/default_book.png'; // Un'immagine di default se non c'è la copertina

          return {
            ...libro,
            idFormato: f?.id,
            prezzo: f?.prezzo || 0,
            quantita: f?.quantita || 0,
            copertina: copertinaUrl
          };
        });

        this.libri.set(mappati);
        
        // Estrazione categorie
        const nomiCat = data.flatMap(l => l.categorie?.map(c => c.nome) ?? []);
        this.categorie.set([...new Set<string>(nomiCat)]);
        
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Errore API Catalogo:', err);
        this.loading.set(false);
      }
    });
  }

  // --- Metodi Utility ---
  aggiornaFiltri(): void {
    this.libri.set([...this.libri()]);
  }

  reset(): void {
    this.ricerca = '';
    this.categoriaSelezionata = '';
    this.ordinamento = 'titolo';
    this.aggiornaFiltri();
  }

aggiungiAlCarrello(event: Event, libro: any): void {
  event.stopPropagation(); // Evita di aprire la scheda libro se hai un link sul contenitore
  
  if (!this.auth.isLoggedIn()) {
    alert('Devi essere loggato per aggiungere prodotti al carrello!');
    // Opzionale: this.router.navigate(['/auth/login']);
    return;
  }

  if (libro.idFormato) {
    this.carrelloService.aggiungi(libro.idFormato).subscribe({
      next: (res) => {
        // Opzionale: un feedback visivo (es. un toast o un alert)
        console.log('Prodotto aggiunto!', res);
        alert('Libro aggiunto al carrello!');
      },
      error: (err) => {
        console.error('Errore durante l\'aggiunta:', err);
        alert('Errore: ' + (err.error?.message || 'Impossibile aggiungere il libro'));
      }
    });
  } else {
    console.error('Errore: Il libro non ha un formato valido.');
  }
}
}