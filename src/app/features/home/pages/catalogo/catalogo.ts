import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LibroService } from '../../../../core/services/libro';
import { CarrelloService } from '../../../../core/services/carrello';
import { AuthService } from '../../../../core/services/auth';
import { LibroDTO } from '../../../../core/models/libro.model';
import { BookHoverDirective } from '../../../../shared/directives/book-hover.directive';
import { Libro } from '../../../../core/models/models';

@Component({
  selector: 'app-catalogo',
  // Scegliamo Standalone di Aldo per modernità
  standalone: true, 
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
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
  soloPreferiti = false;

  libriFiltrati = computed(() => {
    let risultati = [...this.libri()];

    if (this.ricerca.trim()) {
      const query = this.ricerca.toLowerCase();
      risultati = risultati.filter(l =>
        l.titolo?.toLowerCase().includes(query) ||
        l.autore?.nome?.toLowerCase().includes(query) ||
        l.autore?.cognome?.toLowerCase().includes(query) ||
        l.editore?.nome?.toLowerCase().includes(query)
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
          const copertinaUrl = f?.copertina 
            ? (f.copertina.startsWith('http') ? f.copertina : urlServer + f.copertina) 
            : '/assets/images/default-book.png';

          // NOVITÀ: Calcoliamo se il formato principale è disponibile! (Se EBOOK è sempre true)
          const isEbook = f?.tipoSupporto === 'EBOOK';
          const disponibile = isEbook || (f?.quantita ? f.quantita > 0 : false);

          return {
            ...libro,
            formati: libro.formati || [],
            idFormato: f?.id,
            prezzo: f?.prezzo || 0,
            quantita: f?.quantita || 0,
            disponibile: disponibile, // Passiamo questo booleano all'HTML
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
    event.stopPropagation(); 
    
    if (!this.auth.isLoggedIn()) {
      alert('Devi essere loggato per aggiungere prodotti al carrello!');
      return;
    }

    if (this.auth.isValidato() != true) {
    alert('Devi aver validato la mail per aggiungere prodotti al carrello!');
    // Opzionale: this.router.navigate(['/auth/login']);
    return;
  }

    if (libro.idFormato) {
      this.carrelloService.aggiungi(libro.idFormato).subscribe({
        next: (res) => {
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

  stelle(n: number): string {
    return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
  }

  toggleMiPiace(event: Event, libro: any){
    event.stopPropagation();
    this.libroService.toggleMiPiace(libro.id);
    libro.miPiace = !libro.miPiace;
  }
  
  eliminaLibro(event: Event, id: number): void {
    event.stopPropagation(); 
    
    if (confirm('Sei sicuro di voler eliminare questo libro dal catalogo?')) {
      this.libroService.delete(id).subscribe({
        next: () => {
          alert('Libro eliminato con successo!');
          this.inizializzaCatalogo(); 
        },
        error: (err: any) => {
          console.error('Errore durante l\'eliminazione:', err);
          alert('Errore: impossibile eliminare il libro.');
        }
      });
    }
  }
}