import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CarrelloService } from '../../../../core/services/carrello';
import { CarrelloDTO } from '../../../../core/models/models';


@Component({
  selector: 'app-carrello',
  standalone: false,
  templateUrl: './carrello.html',
  styleUrl: './carrello.css'
})
export class Carrello implements OnInit {
  carrello: CarrelloDTO | null = null;
  private cdr = inject(ChangeDetectorRef);


  constructor(public carrelloService: CarrelloService) {}


   ngOnInit(): void {

  this.carrelloService.carrello$.subscribe((data) => {
    if (data && data.items) {
      const urlServer = 'http://localhost:8080/uploads/';
      
      const itemsMappati = data.items.map(item => ({
        ...item,
        copertina: item.copertina 
          ? (item.copertina.startsWith('http') ? item.copertina : urlServer + item.copertina) 
          : '/assets/images/default-book.png'
      }));

      // Ordiniamo gli item mappati
      const itemsOrdinati = [...itemsMappati].sort((a, b) => a.id - b.id);
      
      // Assegniamo al modello del componente
      this.carrello = { ...data, items: itemsOrdinati };
    } else {
      this.carrello = data;
    }
    
    // Forza il ricaricamento della vista
    this.cdr.detectChanges();
  });

  // Caricamento iniziale
  this.carrelloService.loadCarrello();
}
      

  aumenta(idItem: number): void {
  this.carrelloService.aumenta(idItem).subscribe({
    next: () => {
      this.cdr.detectChanges();
    },
    error: (err) => {
      // intercettiamo il messaggio lanciato dal backend
      // Se l'errore è un 400 Bad Request, il messaggio sarà nel corpo della risposta
      const messagioErrore = err.error?.message || err.error || "Non è possibile aumentare la quantità.";
      
      console.error("Errore server:", err);
      alert(messagioErrore); // mostra il messaggio specifico all'utente
    }
  });
}

  diminuisci(idItem: number): void {
    this.carrelloService.diminuisci(idItem).subscribe({
      next: () => {
          this.carrelloService.loadCarrello();
          this.cdr.detectChanges(); // forza l'aggiornamento dopo la chiamata
        }
    });
  }

  rimuovi(idItem: number): void {
    if(confirm("Sei sicuro di voler rimuovere questo articolo dal carrello?")) {
      this.carrelloService.rimuovi(idItem).subscribe({
        next: () => {
          //this.carrelloService.loadCarrello();
          // non serve più chiamare loadCarrello() perché lo fa il servizio col 'tap'
          this.cdr.detectChanges(); // forza l'aggiornamento dopo la chiamata
        }
      });
    }
  }

  spostaInWishlist(idItem: number): void {
    this.carrelloService.spostaInWishlist(idItem).subscribe({
      next: () => {
        this.carrelloService.loadCarrello(); 
        this.cdr.detectChanges();
        alert("Prodotto spostato in wishlist con successo!");
      },
      error: (err) => alert("Errore durante lo spostamento: " + err.error.message)
    });
  }

// Svuota carrello
svuotaCarrello(): void {
  if (confirm('Sei sicuro di voler svuotare il carrello?')) {

    this.carrelloService.svuota().subscribe({
      next: () => {
        alert("Carrello svuotato con successo!");
     
      },
      error: (err) => alert("Errore durante lo svuotamento: " + err.error.message)
    });
  }
}


}