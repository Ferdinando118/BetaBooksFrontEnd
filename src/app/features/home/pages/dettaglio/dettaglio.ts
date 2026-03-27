import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LibroService } from '../../../../core/services/libro';
import { CarrelloService } from '../../../../core/services/carrello';
import { AuthService } from '../../../../core/services/auth';

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

  formRecensione: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private libroService: LibroService,
    private carrelloService: CarrelloService,
    public auth: AuthService,
    private fb: FormBuilder
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
  }

  aggiungiAlCarrello(): void {
    const libro = this.libro();
    if (!libro) return;
    this.carrelloService.aggiungi(libro);
    this.aggiunto.set(true);
    setTimeout(() => this.aggiunto.set(false), 2000);
  }

  inviaRecensione(): void {
    if (this.formRecensione.invalid) return;
    // TODO: chiamare RecensioneService quando disponibile
    console.log('Recensione:', this.formRecensione.value);
    this.recensioneInviata.set(true);
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