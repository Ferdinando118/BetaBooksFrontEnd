import { Component, OnInit } from '@angular/core';
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

  constructor(public carrelloService: CarrelloService) {}

  ngOnInit(): void {
    this.carrelloService.loadCarrello();

    this.carrelloService.carrello$.subscribe((data) => {
      this.carrello = data;
    });
  }

  aumenta(idItem: number): void {
    this.carrelloService.aumenta(idItem).subscribe();
  }

  diminuisci(idItem: number): void {
    // Nota: Il backend dovrebbe gestire se la quantità arriva a 0, 
    // solitamente o lo impedisce o elimina l'item.
    this.carrelloService.diminuisci(idItem).subscribe();
  }

  rimuovi(idItem: number): void {
    if(confirm("Sei sicuro di voler rimuovere questo articolo?")) {
      this.carrelloService.rimuovi(idItem).subscribe();
    }
  }

  // NUOVA AZIONE
  spostaInWishlist(idItem: number): void {
    this.carrelloService.spostaInWishlist(idItem).subscribe({
      next: () => console.log("Spostato in wishlist"),
      error: (err) => alert("Errore durante lo spostamento: " + err.error.message)
    });
  }
}