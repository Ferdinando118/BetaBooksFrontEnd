import { Component, OnInit, inject } from '@angular/core';
import { OrdineService } from '../../../../core/services/ordine'; 
import { AuthService } from '../../../../core/services/auth'; 
import { OrdineDTO, FiltroTemporale } from '../../../../core/models/models';
import { Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-ordini',
  standalone: false,
  templateUrl: './ordini.html',
  styleUrl: './ordini.css'
})
export class Ordini implements OnInit {
  private ordineService = inject(OrdineService);
  private auth = inject(AuthService);
  private cdr           = inject(ChangeDetectorRef);


  ordini: OrdineDTO[] = [];
  loading = false;
  ordineAperto: number | null = null;

  filtroCompletati: boolean = false;
  filtroPeriodo: string = 'TUTTO';
  private filtriChange$ = new Subject<void>();

  opzioniPeriodo = [
    { label: 'Tutto lo storico', value: 'TUTTO' },
    { label: 'Ultimi 30 giorni', value: 'ULTIMI_30_GIORNI' },
    { label: 'Ultimi 3 mesi', value: 'ULTIMI_3_MESI' },
    { label: 'Ultimi 6 mesi', value: 'ULTIMI_6_MESI' },
    { label: 'Ultimo anno', value: 'ULTIMO_ANNO' }
  ];

  ngOnInit(): void {
  this.filtriChange$.pipe(
    switchMap(() => {
      const utente = this.auth.grant().utente;
      if (!utente) return [];
      this.loading = true;
      return this.ordineService.getOrdiniFiltrati(
        utente.id, this.filtroCompletati, this.filtroPeriodo as any
      );
    })
  ).subscribe({
  next: (ordini) => {
    // 1. STAMPA SEMPRE COSA ARRIVA DAL SERVER
    console.log("DEBUG ORDINI ARRIVATI:", ordini); 
    
    if (!ordini || ordini.length === 0) {
      console.log("La lista ordini è vuota.");
      this.ordini = [];
    } else {
      const urlServer = 'http://localhost:8080/uploads/';
      
      this.ordini = ordini.map(ordine => {
        // 2. CONTROLLA COME SI CHIAMA LA LISTA DEI LIBRI DENTRO L'ORDINE
        console.log("Struttura ordine:", ordine); 
        
        return {
          ...ordine,
          // Se qui 'items' è undefined, allora il nome nel DTO è diverso!
          items: (ordine.items || []).map((item: any) => ({
            ...item,
            copertina: item.copertina 
              ? (item.copertina.startsWith('http') ? item.copertina : urlServer + item.copertina) 
              : '/assets/images/default-book.png'
          }))
        };
      });
    }
    
    this.loading = false;
    this.cdr.markForCheck();
  },
  error: (err) => { 
    console.error("ERRORE NELLA PIPE:", err); 
    this.loading = false; 
    this.cdr.markForCheck(); 
  }
});

  this.filtriChange$.next();
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
    //this.caricaOrdini();
    this.filtriChange$.next(); // emette, switchMap cancella quella in volo
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

}