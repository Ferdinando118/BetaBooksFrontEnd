import { Component, inject, signal, OnInit } from '@angular/core'; // Aggiungi inject e signal
import { WishlistService } from '../../core/services/wishlist';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-wishlist',
  imports: [],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist implements OnInit {
  // Iniezione moderna dei servizi (disponibile da Angular 14+)
  private wishlistService = inject(WishlistService);
  private auth = inject(AuthService);

  // Definizione dei segnali
  wishlistItems = signal<any[]>([]);

  ngOnInit() {
    this.getWishlist();
  }

  getWishlist() {
    const userId = this.auth.getUserId();
    if (!userId) return;
    
    this.wishlistService.getWishlistByUser(userId).subscribe(items => {
      this.wishlistItems.set(items);
    });
  }

  spostaAlCarrello(item: any) {
    this.wishlistService.spostaNelCarrello(item.id).subscribe({
      next: () => {
        this.getWishlist(); // Ricarica la lista dopo lo spostamento
      },
      error: (err) => console.error("Errore nello spostamento", err)
    });
  }

  // Aggiungi questo metodo nel tuo Wishlist.ts
rimuoviDallaWishlist(idFormato: number) {
  const userId = this.auth.getUserId();
  if (!userId) return;

  this.wishlistService.toggle(userId, idFormato, true).subscribe({
    next: () => {
      // Aggiorniamo la lista rimuovendo l'elemento
      this.getWishlist(); 
    },
    error: (err: any) => console.error("Errore rimozione:", err)
  });
}
}
