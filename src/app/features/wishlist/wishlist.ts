import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { WishlistService } from '../../core/services/wishlist';
import { AuthService } from '../../core/services/auth';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-wishlist',
  standalone: true, 
  imports: [CommonModule, DecimalPipe], 
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css'
})
export class Wishlist implements OnInit {
  wishlistItems: any[] = []; // Array semplice, non un signal
  
  private wishlistService = inject(WishlistService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.getWishlist();
  }

  getWishlist(): void {
    const userId = this.auth.getUserId();
    if (!userId) return;
    
    this.wishlistService.getWishlistByUser(userId).subscribe({
      next: (items) => {
        const urlServer = 'http://localhost:8080/uploads/';
        
        // Mappiamo le immagini come facevi nel carrello
        this.wishlistItems = items.map(item => ({
          ...item,
          copertina: item.copertina 
            ? (item.copertina.startsWith('http') ? item.copertina : urlServer + item.copertina) 
            : '/assets/images/default-book.png'
        }));
        
        this.cdr.detectChanges(); // Forza aggiornamento vista
      },
      error: (err) => console.error("Errore caricamento wishlist:", err)
    });
  }

  spostaAlCarrello(item: any): void {
    this.wishlistService.spostaNelCarrello(item.id).subscribe({
      next: () => {
        alert("Prodotto spostato nel carrello!");
        this.getWishlist(); // Ricarica la lista
      },
      error: (err) => alert("Errore: " + (err.error?.message || "Impossibile spostare"))
    });
  }


      rimuoviDallaWishlist(idWishlist: number): void {
        const userId = this.auth.getUserId();
        if (!userId) return;

        // Usa l'id dell'item (es: 24, 25, 27)
        // Nota: ho sostituito 'idFormato' con 'idWishlist'
        this.wishlistService.toggle(userId, idWishlist, true).subscribe({
          next: () => {
            this.getWishlist(); 
          },
          error: (err) => console.error("Errore rimozione:", err)
        });
      }
}