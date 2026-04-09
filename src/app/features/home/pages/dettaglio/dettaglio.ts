import { Component, OnInit, signal, computed } from '@angular/core';
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
  // --- 1. Signals di base ---
  libro = signal<any | null>(null);
  formati = signal<any[]>([]);
  recensioni = signal<any[]>([]);
  loading = signal(true);
  aggiunto = signal(false);
  recensioneInviata = signal(false);
  erroreRecensione = signal<string | null>(null);

  // --- 2. Computed Signals (Quelli che mancavano!) ---
  formatoPrincipale = computed(() => this.formati().length > 0 ? this.formati()[0] : null);
  disponibile = computed(() => (this.formatoPrincipale()?.quantita || 0) > 0);

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
        
        // Salviamo nel signal i formati che arrivano DIRETTAMENTE dal libro!
        if (libro.formati) {
          this.formati.set(libro.formati);
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
      next: (res) => this.recensioni.set(res),
      error: (err) => console.error('Errore recensioni:', err)
    });
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

    // Usiamo il computed signal per maggiore sicurezza!
    const formato = this.formatoPrincipale();
    if (!formato) {
      alert('Formato non disponibile per questo libro.');
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
        this.caricaRecensioni(this.libro()?.id);
      },
      error: (err) => {
        console.error("Errore API:", err);
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