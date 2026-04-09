import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common'; // Aggiungi questi
import { FormsModule } from '@angular/forms'; // Aggiungi questo
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

  ordini: OrdineDTO[] = [];
  // Usiamo l'array di stringhe che corrispondono al tuo Enum StatoOrdine del backend
  stati = Object.values(StatoOrdine); 

  showModal = false;
  ordineSelezionato: any = null;
  nuovoStatoSelezionato: StatoOrdine | any = '';

  ngOnInit() {
    this.caricaOrdini();
  }

caricaOrdini() {
  this.ordineService.getTuttiGliOrdini().subscribe({
    next: (data: any) => {
      console.log("Dati ricevuti dal server:", data);
      
      let listaGrezza = [];
      if (Array.isArray(data)) {
        listaGrezza = data;
      } else if (data && data.obj) {
        listaGrezza = data.obj;
      }

      this.ordini = listaGrezza; 
    },
    error: (err) => console.error("Errore HTTP:", err)
  });
}

onStatoChange(idOrdine: number, nuovoStato: any) {
  this.ordineService.aggiornaStato(idOrdine, nuovoStato).subscribe({
    next: (res: Resp) => {
      // Dato che non c'è .success, usiamo la presenza del messaggio 
      // o semplicemente il fatto che siamo nel 'next'
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

// Cambia il metodo openConfirmModal così:
openConfirmModal(ordine: any, nuovoStato: any) {
  console.log("Apertura modale per ordine:", ordine.id, "Nuovo stato:", nuovoStato);
  
  this.ordineSelezionato = ordine;
  this.nuovoStatoSelezionato = nuovoStato;
  this.showModal = true;
}

// Assicurati che confirmChange sia così:
confirmChange() {
  if (this.ordineSelezionato && this.nuovoStatoSelezionato) {
    this.ordineService.aggiornaStato(
      this.ordineSelezionato.id, 
      this.nuovoStatoSelezionato as StatoOrdine
    ).subscribe({
      next: (res) => {
        console.log("Aggiornamento riuscito");
        this.showModal = false; // Chiudiamo subito
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
