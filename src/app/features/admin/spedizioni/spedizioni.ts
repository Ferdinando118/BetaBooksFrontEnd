import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { OrdineService } from '../../../core/services/ordine';
import { OrdineDTO, Resp, StatoOrdine } from '../../../core/models/models';

@Component({
  selector: 'app-spedizioni',
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './spedizioni.html',
  styleUrls: ['./spedizioni.css']
})
export class Spedizioni implements OnInit {
  private ordineService = inject(OrdineService);
  private cdr = inject(ChangeDetectorRef);

  searchTerm: string = '';
  ordiniFiltrati: OrdineDTO[] = []; 

  ordini: OrdineDTO[] = [];
  // array di stringhe che corrispondono all' Enum StatoOrdine del backend
  stati = Object.values(StatoOrdine); 

  showModal = false;
  ordineSelezionato: any = null;
  nuovoStatoSelezionato: StatoOrdine | any = '';

ngOnInit() {
  console.log("Componente Spedizioni inizializzato");

  this.caricaOrdini();
  setTimeout(() => {
    if (this.ordini.length === 0) {
      console.log("Tabella ancora vuota, forzo caricamento di sicurezza...");
      this.caricaOrdini();
    }
  }, 500);
}

caricaOrdini() {
    this.ordineService.getTuttiGliOrdini().subscribe({
      next: (data: any) => {
        console.log("Dati ricevuti dal server:", data);
        const listaGrezza = Array.isArray(data) ? data : (data?.obj || []);
        
        this.ordini = [...listaGrezza]; 
        this.applicaFiltro();
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error("Errore HTTP:", err)
    });
  }

  applicaFiltro() {
  if (!this.searchTerm) {
    this.ordiniFiltrati = [...this.ordini];
  } else {
    const s = this.searchTerm.toLowerCase();
    this.ordiniFiltrati = this.ordini.filter(o => 
      o.id.toString().includes(s) || 
      o.metodoPagamento?.toLowerCase().includes(s) ||
      o.stato?.toLowerCase().includes(s)
    );
  }
}


  onStatoChange(idOrdine: number, nuovoStato: any) {
    this.ordineService.aggiornaStato(idOrdine, nuovoStato).subscribe({
      next: (res: Resp) => {
        console.log('Risposta server:', res.message);
        this.caricaOrdini(); // Ricarichiamo per aggiornare tracking e colori
        alert("Stato aggiornato con successo!");
      },
      error: (err) => {
        console.error(err);
        alert("Errore durante l'aggiornamento dello stato");
      }
    });
  }

  openConfirmModal(ordine: any, nuovoStato: any) {
    console.log("Apertura modale per ordine:", ordine.id, "Nuovo stato:", nuovoStato);
    
    this.ordineSelezionato = ordine;
    this.nuovoStatoSelezionato = nuovoStato;
    this.showModal = true;
  }

  confirmChange() {
    if (this.ordineSelezionato && this.nuovoStatoSelezionato) {
      this.ordineService.aggiornaStato(
        this.ordineSelezionato.id, 
        this.nuovoStatoSelezionato as StatoOrdine
      ).subscribe({
        next: (res) => {
          console.log("Aggiornamento riuscito");
          this.showModal = false; 
          this.caricaOrdini();
        },
        error: (err) => {
          console.error("Errore server:", err);
          alert("Errore durante l'aggiornamento");
          this.closeModal();
        }
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.ordineSelezionato = null;
    this.nuovoStatoSelezionato = '';
    
    this.caricaOrdini(); 
  }

  
}
