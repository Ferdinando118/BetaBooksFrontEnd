import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LibroService } from '../../../../core/services/libro';
import { CarrelloService } from '../../../../core/services/carrello';
import { AuthService } from '../../../../core/services/auth';
import { Libro, Recensione, TipoEdizione } from '../../../../core/models/models';

const MOCK_RECENSIONI: Recensione[] = [
  { id: 1, idUtente: 1, idLibro: 1, valutazione: 5, descrizione: 'Capolavoro assoluto, da leggere almeno una volta nella vita!', data: '2025-01-15T10:00:00' },
  { id: 2, idUtente: 2, idLibro: 1, valutazione: 4, descrizione: 'Molto bello, un po\' lento all\'inizio ma poi coinvolgente.', data: '2025-02-20T14:00:00' },
  { id: 3, idUtente: 3, idLibro: 2, valutazione: 5, descrizione: 'Magico! Lo rileggo ogni anno.', data: '2025-03-01T09:00:00' },
];

@Component({
  selector: 'app-dettaglio',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './dettaglio.html',
  styleUrl: './dettaglio.css'
})
export class Dettaglio implements OnInit {
  libro: Libro | null = null;
  recensioni: Recensione[] = [];
  loading = true;
  aggiunto = false;
  hoverRating = 0;

  readonly TipoEdizione = TipoEdizione;
  edizioneSelezionata: TipoEdizione = TipoEdizione.COPERTINA_FLESSIBILE;
  edizioni: TipoEdizione[] = [
    TipoEdizione.COPERTINA_FLESSIBILE,
    TipoEdizione.COPERTINA_RIGIDA,
    TipoEdizione.EBOOK
  ];

  formRecensione: FormGroup;
  recensioneInviata = false;

  constructor(
    private route: ActivatedRoute,
    private libroService: LibroService,
    private carrelloService: CarrelloService,
    public auth: AuthService,
    private fb: FormBuilder
  ) {
    this.formRecensione = this.fb.group({
      valutazione:  [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      descrizione:  ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.libroService.getById(id).subscribe((libro: Libro) => {
      this.libro = libro;
      this.recensioni = MOCK_RECENSIONI.filter(r => r.idLibro === id);
      this.loading = false;
    });
  }

  aggiungiAlCarrello(): void {
    if (!this.libro) return;
    this.carrelloService.aggiungi(this.libro, this.edizioneSelezionata);
    this.aggiunto = true;
    setTimeout(() => this.aggiunto = false, 2000);
  }

  prezzoEdizione(edizione: TipoEdizione): number {
    if (!this.libro) return 0;
    return this.carrelloService.getPrezzoEdizione(this.libro, edizione);
  }

  onEdizioneChange(rawValue: string): void {
    this.edizioneSelezionata = rawValue as TipoEdizione;
  }

  inviaRecensione(): void {
    if (this.formRecensione.invalid) return;
    this.recensioneInviata = true;
  }

  stelle(n: number): string {
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  mediaVoti(): number {
    if (!this.recensioni.length) return 0;
    return this.recensioni.reduce((a, r) => a + r.valutazione, 0) / this.recensioni.length;
  }

  toggleMiPiace(): void {
    if (!this.libro) return;
    this.libroService.toggleMiPiace(this.libro.id);
    this.libro.miPiace = !this.libro.miPiace;
  }

  setRating(voto: number): void {
    this.formRecensione.patchValue({ valutazione: voto });
  }
}