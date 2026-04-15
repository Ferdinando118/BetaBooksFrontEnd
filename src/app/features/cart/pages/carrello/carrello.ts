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

      
      const itemsOrdinati = [...itemsMappati].sort((a, b) => a.id - b.id);
      
      
      this.carrello = { ...data, items: itemsOrdinati };
    } else {
      this.carrello = data;
    }
    
    
    this.cdr.detectChanges();
  });

  
  this.carrelloService.loadCarrello();
}
      

  aumenta(idItem: number): void {
  this.carrelloService.aumenta(idItem).subscribe({
    next: () => {
      this.cdr.detectChanges();
    },
    error: (err) => {
      
      
      const messagioErrore = err.error?.message || err.error || "Non è possibile aumentare la quantità.";
      
      console.error("Errore server:", err);
      alert(messagioErrore); 
    }
  });
}

  diminuisci(idItem: number): void {
    this.carrelloService.diminuisci(idItem).subscribe({
      next: () => {
          this.carrelloService.loadCarrello();
          this.cdr.detectChanges(); 
        }
    });
  }

  rimuovi(idItem: number): void {
    if(confirm("Sei sicuro di voler rimuovere questo articolo dal carrello?")) {
      this.carrelloService.rimuovi(idItem).subscribe({
        next: () => {
          
          
          this.cdr.detectChanges(); 
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