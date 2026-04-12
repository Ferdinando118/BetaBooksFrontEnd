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
import { WishlistService } from '../../../../core/services/wishlist';

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
  private readonly wishlistService = inject(WishlistService);

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
/*
  private inizializzaCatalogo(): void {
    this.loading.set(true);
    const userId = this.auth.getUserId();

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
            copertina: copertinaUrl,
            miPiace: this.libroService.isMiPiace(libro.id)
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
  }*/

    private inizializzaCatalogo(): void {
  this.loading.set(true);
  const userId = this.auth.getUserId();

  // 1. Carichiamo i libri
  this.libroService.getAll().subscribe({
    next: (data: LibroDTO[]) => {
      
      // 2. Se l'utente è loggato, recuperiamo la sua wishlist dal database
      if (userId) {
        this.wishlistService.getWishlist(userId).subscribe({
          next: (wishlistItems) => {
            // Estraiamo solo gli ID dei formati presenti in wishlist
            // Nota: verifica se nel tuo DTO l'id è dentro 'formatoLibro.id' o 'idFormato'
            const formatoIdsInWishlist = wishlistItems.map(item => item.libro?.id);

            console.log("Dati Wishlist ricevuti:", wishlistItems);
            const libroIdsInWishlist = wishlistItems.map(item => item.libro?.id);
            console.log("ID estratti:", libroIdsInWishlist);

            // Mappiamo i libri incrociando i dati con la wishlist del DB
            this.completaMappatura(data, formatoIdsInWishlist);
          },
          error: (err) => {
            console.error('Errore nel caricamento wishlist:', err);
            // In caso di errore wishlist, mostriamo i libri senza preferiti
            this.completaMappatura(data, []);
          }
        });
      } else {
        // Se non è loggato, mappatura standard senza preferiti
        this.completaMappatura(data, []);
      }
    },
    error: (err) => {
      console.error('Errore API Catalogo:', err);
      this.loading.set(false);
    }
  });
}


private completaMappatura(data: LibroDTO[], libroIdsInWishlist: number[]): void {
  const urlServer = 'http://localhost:8080/uploads/';

  const mappati = data.map(libro => {
    const f = libro.formati?.[0];
    const copertinaUrl = f?.copertina 
      ? (f.copertina.startsWith('http') ? f.copertina : urlServer + f.copertina) 
      : '/assets/images/default-book.png';

    const isEbook = f?.tipoSupporto === 'EBOOK';
    const disponibile = isEbook || (f?.quantita ? f.quantita > 0 : false);

    return {
      ...libro,
      formati: libro.formati || [],
      idFormato: f?.id,
      prezzo: f?.prezzo || 0,
      quantita: f?.quantita || 0,
      disponibile: disponibile,
      copertina: copertinaUrl,
      // NOVITÀ: miPiace è true se l'id del formato è nell'elenco della wishlist del DB
      miPiace: f ? libroIdsInWishlist.includes(libro.id) : false
    };
  });

  this.libri.set(mappati);

  // Estrazione categorie (rimane uguale)
  const nomiCat = data.flatMap(l => l.categorie?.map(c => c.nome) ?? []);
  this.categorie.set([...new Set<string>(nomiCat)]);
  
  this.loading.set(false);
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


toggleMiPiace(event: Event, libro: any) {
  event.stopPropagation();
  const userId = this.auth.getUserId();
  
  if (!userId) {
    alert('Devi essere loggato!');
    return;
  }

  this.wishlistService.toggle(userId, libro.idFormato, libro.miPiace).subscribe({
    next: () => {
      libro.miPiace = !libro.miPiace;

      // forza l'aggiornamento del signal
      // Poiché il signal è un array, devi creare una copia per triggerare la UI
      this.libri.set([...this.libri()]);
    },
    error: (err) => {
      console.error('Errore durante la modifica wishlist:', err);
      // Qui vedremo nel log della console il messaggio di errore del backend
      alert('Errore di comunicazione con il server');
    }
  });
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