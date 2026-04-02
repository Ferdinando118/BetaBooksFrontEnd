import { Component, OnInit, inject } from '@angular/core';
import { OrdineService } from '../../../../core/services/ordine'; 
import { AuthService } from '../../../../core/services/auth'; 
import { OrdineDTO } from '../../../../core/models/models';

@Component({
  selector: 'app-ordini',
  standalone: false,
  templateUrl: './ordini.html',
  styleUrl: './ordini.css'
})
export class Ordini implements OnInit {
  private ordineService = inject(OrdineService);
  private auth = inject(AuthService);

  ordini: OrdineDTO[] = [];
  loading = false;
  ordineAperto: number | null = null;

  ngOnInit(): void {
    this.caricaOrdini();
  }

  caricaOrdini(): void {
    const utente = this.auth.grant().utente;
    if (utente) {
      this.loading = true;
      this.ordineService.getOrdiniUtente(utente.id).subscribe({
        next: (ordini: OrdineDTO[]) => {
          // SPIAMO I DATI DAL SERVER:
          console.log("DATI DAL SERVER:", ordini); 
          
          this.ordini = ordini;
          this.loading = false;
        },
        error: (err: any) => {
          console.error("Errore nel caricamento degli ordini", err);
          this.loading = false;
        }
      });
    }
  }

  toggleDettaglio(id: number): void {
    if (this.ordineAperto === id) {
      this.ordineAperto = null;
    } else {
      this.ordineAperto = id;
    }
  }

  badgeClasse(stato: string): string {
    switch (stato?.toUpperCase()) {
      case 'IN_ATTESA': return 'badge badge-warning';
      case 'SPEDITO': return 'badge badge-info';
      case 'CONSEGNATO': return 'badge badge-success';
      default: return 'badge badge-secondary';
    }
  }

  iconaStato(stato: string): string {
    switch (stato?.toUpperCase()) {
      case 'IN_ATTESA': return '⏳';
      case 'SPEDITO': return '🚚';
      case 'CONSEGNATO': return '✅';
      default: return '📦';
    }
  }

  // --- NUOVO METODO PER IL BUG DELLE IMMAGINI ---
  getImmagine(copertina: string | undefined | null): string {
    if (!copertina) {
      return '/images/default-book.png'; 
    }
    if (copertina.startsWith('http')) {
      return copertina;
    }
    return 'http://localhost:8080/uploads/' + copertina;
  }
}