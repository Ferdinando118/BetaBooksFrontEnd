import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LibroService } from '../../../../core/services/libro';
import { CarrelloService } from '../../../../core/services/carrello';
import { AuthService } from '../../../../core/services/auth';
import { RecensioneService } from '../../../../core/services/recensione';

@Component({
  selector: 'app-dettaglio',
  standalone: false,
  templateUrl: './dettaglio.html',
  styleUrl: './dettaglio.css'
})
export class Dettaglio implements OnInit {
  libro = signal<any | null>(null);
  formati = signal<any[]>([]);
  recensioni = signal<any[]>([]);
  loading = signal(true);
  aggiunto = signal(false);
  recensioneInviata = signal(false);
  erroreRecensione = signal<string | null>(null); // Per gestire il blocco "libro non consegnato"

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

    // Carica il libro
    this.libroService.getById(id).subscribe({
      next: (libro) => {
        this.libro.set(libro);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento libro:', err);
        this.loading.set(false);
      }
    });

    // Carica i formati disponibili per questo libro
    this.libroService.getFormatiByLibro(id).subscribe({
      next: (formati) => this.formati.set(formati),
      error: (err) => console.error('Errore caricamento formati:', err)
    });

    this.caricaRecensioni(id);
  }

  caricaRecensioni(idLibro: number) {
    this.recensioneService.getByLibro(idLibro).subscribe({
      next: (res) => this.recensioni.set(res),
      error: (err) => console.error('Errore recensioni:', err)
    });
  }

  aggiungiAlCarrello(): void {
    const libro = this.libro();
    if (!libro) return;
    this.carrelloService.aggiungi(libro);
    this.aggiunto.set(true);
    setTimeout(() => this.aggiunto.set(false), 2000);
  }
/*
  inviaRecensione(): void {
    if (this.formRecensione.invalid) return;
    // TODO: chiamare RecensioneService quando disponibile
    console.log('Recensione:', this.formRecensione.value);
    this.recensioneInviata.set(true);
  }*/

inviaRecensione(): void {
  if (this.formRecensione.invalid) return;

  // Recuperiamo l'utente dal signal 'grant' del service auth
  const utenteLoggato = this.auth.grant().utente;

  if (!utenteLoggato) {
    this.erroreRecensione.set("Devi effettuare il login per lasciare una recensione.");
    return;
  }

  const req = {
    valutazione: this.formRecensione.value.valutazione,
    descrizione: this.formRecensione.value.descrizione,
    idLibro: this.libro()?.id,
    idUtente: utenteLoggato.id 
  };

  this.recensioneService.create(req).subscribe({
    next: (res) => {
      this.recensioneInviata.set(true);
      this.erroreRecensione.set(null);
      // Ricarichiamo la lista per vedere subito la nuova recensione
      this.caricaRecensioni(this.libro()?.id);
    },
    /*
    error: (err) => {
      // Qui gestiamo il messaggio "Non hai acquistato il libro" dal backend
      this.erroreRecensione.set(err.error.message || 'Errore durante l\'invio');
    }*/
   error: (err) => {
      console.error("Errore API:", err);
      // Usiamo l'optional chaining (?.) e un fallback per evitare il crash
      const msg = err?.error?.message || "Errore di connessione al server (403)";
      this.erroreRecensione.set(msg);
    }
  });
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
}