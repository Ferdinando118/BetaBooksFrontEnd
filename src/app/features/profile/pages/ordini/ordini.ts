import { Component, OnInit, inject } from '@angular/core';
import { OrdineService } from '../../../../core/services/ordine'; 
import { AuthService } from '../../../../core/services/auth'; 
import { OrdineDTO, FiltroTemporale } from '../../../../core/models/models';


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

  filtroCompletati: boolean = false;
  filtroPeriodo: string = 'TUTTO';

  opzioniPeriodo = [
    { label: 'Tutto lo storico', value: 'TUTTO' },
    { label: 'Ultimi 30 giorni', value: 'ULTIMI_30_GIORNI' },
    { label: 'Ultimi 3 mesi', value: 'ULTIMI_3_MESI' },
    { label: 'Ultimi 6 mesi', value: 'ULTIMI_6_MESI' },
    { label: 'Ultimo anno', value: 'ULTIMO_ANNO' }
  ];

  ngOnInit(): void {
    this.caricaOrdini();
  }

  caricaOrdini(): void {
    const utente = this.auth.grant().utente;
    if (utente) {
      this.loading = true;
      //this.ordineService.getOrdiniUtente(utente.id).subscribe({
      this.ordineService.getOrdiniFiltrati(utente.id, this.filtroCompletati, this.filtroPeriodo as any).subscribe({
        //next: (ordini: OrdineDTO[]) => {
        next: (ordini) => {
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

  // Metodo chiamato al cambio dei filtri nel template
  onFiltroChange(): void {
    this.ordineAperto = null; // Chiudiamo eventuali dettagli aperti
    this.caricaOrdini();
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
      return '/assets/images/default-book.png'; 
    }
    if (copertina.startsWith('http')) {
      return copertina;
    }
    return 'http://localhost:8080/uploads/' + copertina;
  }
}