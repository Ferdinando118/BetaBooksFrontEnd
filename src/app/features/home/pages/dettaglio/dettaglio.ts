import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LibroService } from '../../../../core/services/libro';
import { CarrelloService } from '../../../../core/services/carrello';
import { AuthService } from '../../../../core/services/auth';
import { RecensioneService } from '../../../../core/services/recensione';
import { AutoreService } from '../../../../core/services/autore';

@Component({
  selector: 'app-dettaglio',
  standalone: false,
  templateUrl: './dettaglio.html',
  styleUrl: './dettaglio.css'
})
export class Dettaglio implements OnInit {
  // --- 1. Signals di base ---
  libro = signal<any | null>(null);
  formati = signal<any[]>([]);
  formatoSelezionato = signal<any | null>(null); // NUOVO: Tiene traccia della scelta dell'utente
  
  recensioni = signal<any[]>([]);
  loading = signal(true);
  aggiunto = signal(false);
  recensioneInviata = signal(false);
  erroreRecensione = signal<string | null>(null);

  biografiaEspansa = false;
  descrizioneEspansa = false;
  editoreEspanso = false;
  recensioneInModifica: any | null = null;

  // --- 2. Computed Signals ---
  // Ora controlla se IL FORMATO SELEZIONATO ha quantità > 0
  disponibile = computed(() => {
    const formato = this.formatoSelezionato();
    if (!formato) return false;
    
    return formato.tipoSupporto === 'EBOOK' || formato.quantita > 0;
  });

  formRecensione: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private libroService: LibroService,
    private carrelloService: CarrelloService,
    public auth: AuthService,
    private fb: FormBuilder,
    private recensioneService: RecensioneService
  ) {
    this.formRecensione = this.fb.group({
      valutazione: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      descrizione: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.libroService.getById(id).subscribe({
      next: (libro) => {
        this.libro.set(libro);
        
        // Salviamo i formati e pre-selezioniamo il primo
        if (libro.formati && libro.formati.length > 0) {
          this.formati.set(libro.formati);
          this.formatoSelezionato.set(libro.formati[0]); // Imposta il default
        }

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento libro:', err);
        this.loading.set(false);
      }
    });

    this.caricaRecensioni(id);
  }

 caricaRecensioni(idLibro: number) {
  this.recensioneService.getByLibro(idLibro).subscribe({
    next: (res) => {
      this.recensioni.set(res);
    
    }
  });
}



  // NUOVO METODO: Crea l'etichetta testuale per i bottoni dei formati
  getLabelFormato(f: any): string {
    if (!f) return '';
    if (f.tipoSupporto === 'EBOOK') return 'E-book Digitale';
    return `Cartaceo (${f.tipoCopertina === 'RIGIDA' ? 'Copertina Rigida' : 'Copertina Flessibile'})`;
  }

  getImmagine(copertina: string | undefined | null): string {
    if (!copertina) return '/assets/images/default-book.png';
    if (copertina.startsWith('http')) return copertina;
    return 'http://localhost:8080/uploads/' + copertina;
  }

  aggiungiAlCarrello(): void {
    if (!this.auth.isLoggedIn()) {
      alert('Devi effettuare il login per aggiungere al carrello.');
      return;
    }

    if(!this.auth.isValidato()){
      alert('Devi effettuare il login per aggiungere al carrello.');
      return;
    }

    // Usiamo il signal del formato selezionato invece di quello principale
    const formato = this.formatoSelezionato();
    if (!formato) {
      alert('Nessun formato selezionato per questo libro.');
      return;
    }

    this.carrelloService.aggiungi(formato.id).subscribe({
      next: () => {
        this.aggiunto.set(true);
        setTimeout(() => this.aggiunto.set(false), 2000);
      },
      error: (err) => {
        console.error(err);
        alert('Errore: ' + (err.error?.message || 'Impossibile aggiungere il libro'));
      }
    });
  }

 inviaRecensione(): void {
    if (this.formRecensione.invalid) return;

    const utenteLoggato = this.auth.grant().utente;
    if (!utenteLoggato) {
      this.erroreRecensione.set("Devi effettuare il login per lasciare una recensione.");
      return;
    }

    // 1. Definiamo la base della richiesta
    const req: any = {
      valutazione: this.formRecensione.value.valutazione,
      descrizione: this.formRecensione.value.descrizione,
      idLibro: this.libro()?.id,
      idUtente: utenteLoggato.id 
    };

    // 2. Se stiamo modificando, aggiungiamo l'ID della recensione!
    if (this.recensioneInModifica) {
      req.id = this.recensioneInModifica.id; 
      
      this.recensioneService.update(req).subscribe({
        next: () => {
          this.recensioneInModifica = null; // Reset dello stato di modifica
          this.formRecensione.reset({ valutazione: 5 }); // Pulisci il form
          this.caricaRecensioni(this.libro()?.id); // Ricarica la lista aggiornata
        },
        error: (err) => {
          console.error("Errore update:", err);
          this.erroreRecensione.set("Errore durante l'aggiornamento.");
        }
      });
    } else {
      // CHIAMATA CREATE (il tuo codice originale va benissimo)
      this.recensioneService.create(req).subscribe({
        next: (res) => {
          this.recensioneInviata.set(true);
          this.erroreRecensione.set(null);
          this.caricaRecensioni(this.libro()?.id);
        },
        error: (err) => {
          console.error("Errore API:", err);
          const msg = err?.error?.message || "Errore di connessione al server";
          this.erroreRecensione.set(msg);
        }
      });
    }
  }
  
  stelle(n: number): string {
    const arrotondato = Math.round(n);
    return '★'.repeat(arrotondato) + '☆'.repeat(5 - arrotondato);
  }

  mediaVoti(): number {
    const lista = this.recensioni();
    if (!lista.length) return 0;
    return lista.reduce((acc, r) => acc + r.valutazione, 0) / lista.length;
  }

  preparaModifica(recensione: any): void {
  this.recensioneInModifica = recensione;
  // Carichiamo i dati della recensione nel form esistente
  this.formRecensione.patchValue({
    valutazione: recensione.valutazione,
    descrizione: recensione.descrizione
  });
}

eliminaRecensione(id: number): void {
  // Richiesta di conferma per sicurezza
  if (confirm("Sei sicuro di voler eliminare questa recensione?")) {
    this.recensioneService.delete(id).subscribe({
      next: (res) => {
        // Dopo l'eliminazione, ricarichiamo la lista per rimuovere la recensione dalla vista
        this.caricaRecensioni(this.libro()?.id);
      },
      error: (err) => {
        console.error("Errore durante l'eliminazione:", err);
        alert("Impossibile eliminare la recensione: " + (err.error?.message || "Errore sconosciuto"));
      }
    });
  }
}
statisticheRecensioni = computed(() => {
    const lista = this.recensioni();
    const totale = lista.length;

    // Struttura base per 5, 4, 3, 2, 1 stelle
    const statistiche = [5, 4, 3, 2, 1].map(stelle => ({
      stelle,
      conteggio: 0,
      percentuale: 0
    }));

    // Se non ci sono recensioni, restituisci array vuoto/azzerato
    if (totale === 0) return { totale, media: 0, barre: statistiche };

    let sommaVoti = 0;

    lista.forEach(r => {
      sommaVoti += r.valutazione;
      // Trova l'indice corretto (5 stelle = index 0, 4 stelle = index 1, ecc.)
      const index = 5 - Math.round(r.valutazione);
      if (index >= 0 && index <= 4) {
        statistiche[index].conteggio++;
      }
    });

    // Calcola le percentuali
    statistiche.forEach(stat => {
      stat.percentuale = Math.round((stat.conteggio / totale) * 100);
    });

    const media = sommaVoti / totale;

    return {
      totale,
      media,
      barre: statistiche
    };
  });

}