import { Component, OnInit, inject } from '@angular/core';
import { OrdineService } from '../../../../core/services/ordine'; 
import { AuthService } from '../../../../core/services/auth'; 
import { OrdineDTO, FiltroTemporale } from '../../../../core/models/models';
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

  filtroStato: string = 'IN_CORSO'; // 'IN_CORSO' | 'CONSEGNATI' | 'ANNULLATI'
  filtroPeriodo: string = 'TUTTO';

  opzioniStato = [
    { label: 'In corso', value: 'IN_CORSO' },
    { label: 'Consegnati', value: 'CONSEGNATI' },
    { label: 'Annullati', value: 'ANNULLATI' }
  ];

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
    if (!utente) {
      console.log("Utente non trovato");
      return;
    }

    this.loading = true;
    // Usa getOrdiniUtente per ottenere TUTTI gli ordini, poi filtri lato frontend
    this.ordineService.getOrdiniUtente(utente.id).subscribe({
      next: (ordini) => {
        console.log("✓ Ordini ricevuti dal backend:", ordini);
        
        if (!ordini || ordini.length === 0) {
          console.log("Lista ordini vuota dal server");
          this.ordini = [];
          this.loading = false;
          return;
        }

        const urlServer = 'http://localhost:8080/uploads/';

        // Filtra per periodo (se selezionato)
        let ordiniByPeriodo = ordini;
        if (this.filtroPeriodo !== 'TUTTO') {
          const now = new Date();
          ordiniByPeriodo = ordini.filter(o => {
            const dataOrdine = new Date(o.dataOrdine);
            const diffMs = now.getTime() - dataOrdine.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            
            switch (this.filtroPeriodo) {
              case 'ULTIMI_30_GIORNI': return diffDays <= 30;
              case 'ULTIMI_3_MESI': return diffDays <= 90;
              case 'ULTIMI_6_MESI': return diffDays <= 180;
              case 'ULTIMO_ANNO': return diffDays <= 365;
              default: return true;
            }
          });
        }

        // Filtra gli ordini in base al filtroStato
        let ordiniFilterti = ordiniByPeriodo;

        console.log(`Filtro attuale: ${this.filtroStato}`);
        console.log("Ordini prima del filtro stato:", ordiniFilterti.map(o => ({ id: o.id, stato: o.stato })));

        if (this.filtroStato === 'IN_CORSO') {
          ordiniFilterti = ordiniByPeriodo.filter(o => o.stato !== 'ANNULLATO' && o.stato !== 'CONSEGNATO');
          console.log("Filtrati IN_CORSO:", ordiniFilterti.map(o => ({ id: o.id, stato: o.stato })));
        } else if (this.filtroStato === 'CONSEGNATI') {
          ordiniFilterti = ordiniByPeriodo.filter(o => o.stato === 'CONSEGNATO');
          console.log("Filtrati CONSEGNATI:", ordiniFilterti.map(o => ({ id: o.id, stato: o.stato })));
        } else if (this.filtroStato === 'ANNULLATI') {
          ordiniFilterti = ordiniByPeriodo.filter(o => o.stato === 'ANNULLATO');
          console.log("Filtrati ANNULLATI:", ordiniFilterti.map(o => ({ id: o.id, stato: o.stato })));
        }

        // Arricchisci gli ordini con le immagini
        this.ordini = ordiniFilterti.map(ordine => ({
          ...ordine,
          items: (ordine.items || []).map((item: any) => ({
            ...item,
            copertina: item.copertina
              ? (item.copertina.startsWith('http') ? item.copertina : urlServer + item.copertina)
              : '/assets/images/default-book.png'
          }))
        }));

        console.log(`✓ Ordini finali visualizzati: ${this.ordini.length}`);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error("✗ Errore nel caricamento degli ordini:", err);
        this.loading = false;
      }
    });
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
      case 'ANNULLATO': return 'badge badge-danger';
      default: return 'badge badge-secondary';
    }
  }

  iconaStato(stato: string): string {
    switch (stato?.toUpperCase()) {
      case 'IN_ATTESA': return '⏳';
      case 'SPEDITO': return '🚚';
      case 'CONSEGNATO': return '✅';
      case 'ANNULLATO': return '❌';
      default: return '📦';
    }
  }

  annullaOrdine(ordineId: number): void {
    if (confirm('Sei sicuro di voler annullare questo ordine?')) {
      this.ordineService.annulla(ordineId).subscribe({
        next: () => {
          alert('Ordine annullato con successo.');
          this.onFiltroChange(); // Ricarica gli ordini
        },
        error: (err) => {
          console.error('Errore nell\'annullamento dell\'ordine', err);
          alert('Errore nell\'annullamento dell\'ordine.');
        }
      });
    }
  }

}