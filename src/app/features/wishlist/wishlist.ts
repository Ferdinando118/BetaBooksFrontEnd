import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { WishlistService } from '../../core/services/wishlist';
import { AuthService } from '../../core/services/auth';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist implements OnInit {
  wishlistItems: any[] = [];

  private wishlistService = inject(WishlistService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.getWishlist();
  }

  getWishlist(): void {
    const userId = this.auth.getUserId();
    if (!userId) return;

    const urlServer = 'http://localhost:8080/uploads/';

    this.wishlistService.getWishlistByUser(userId).subscribe({
      next: (items) => {
        this.wishlistItems = items.map((item) => ({
          ...item,
          libro: item.libro || {},
          formato: {
            ...(item.formato || {}),
            copertina: item.formato?.copertina
              ? item.formato.copertina.startsWith('http')
                ? item.formato.copertina
                : urlServer + item.formato.copertina
              : '/assets/images/default-book.png',
          },
        }));

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Errore caricamento wishlist:', err),
    });
  }

  spostaAlCarrello(idWishlist: number): void {
    this.wishlistService.spostaNelCarrello(idWishlist).subscribe({
      next: () => {
        alert('Prodotto spostato nel carrello!');
        this.getWishlist();
      },
      error: (err) => {
        const messaggio = err.error || 'Impossibile spostare il prodotto.';
        alert(messaggio);
      },
    });
  }

  rimuoviDallaWishlist(item: any): void {
    const userId = this.auth.getUserId();
    if (!userId) return;

    const formatId = item.formatId;

    this.wishlistService.toggle(userId, formatId, true).subscribe({
      next: () => this.getWishlist(),
      error: (err) => {
        console.error('Errore durante la rimozione:', err);
        alert('Errore durante la rimozione.');
      },
    });
  }

  svuotaWishlist(): void {
    if (confirm('Sei sicuro di voler rimuovere tutti i prodotti dalla wishlist?')) {
      const userId = this.auth.getUserId();
      if (!userId) return;

      this.wishlistService.svuotaWishlist(userId).subscribe({
        next: () => this.getWishlist(),
        error: (err) => console.error('Errore durante la pulizia:', err),
      });
    }
  }
}
