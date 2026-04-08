import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CarrelloService } from '../../../../core/services/carrello';
import { CarrelloItem, Indirizzo, MetodoPagamento, TipoSpedizione } from '../../../../core/models/models';
import { OrdineService } from '../../../../core/services/ordine';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit, OnDestroy {
  form: FormGroup;
  items: CarrelloItem[] = [];
  totale = 0;
  ordinato = false;
  loading = false;
  private readonly destroy$ = new Subject<void>();

  spedizioni = [
    { value: TipoSpedizione.STANDARD,   label: '🚚 Spedizione standard (5-7 giorni)', costo: 4.99 },
    { value: TipoSpedizione.ESPRESSA,   label: '🚀 Spedizione espressa (1-2 giorni)', costo: 9.99 },
    { value: TipoSpedizione.PROGRAMMATA,label: '📅 Spedizione programmata', costo: 14.99 }
  ]

  metodi = [
    { value: MetodoPagamento.CARTA,     label: '💳 Carta di credito' },
    { value: MetodoPagamento.PAYPAL,    label: '🅿️ PayPal' },
    { value: MetodoPagamento.CONSEGNA,  label: '🚪 Contrassegno' },
    { value: MetodoPagamento.BONIFICO,  label: '🏦 Bonifico' }
  ];

  constructor(
    private fb: FormBuilder,
    private carrelloService: CarrelloService,
    private ordineService: OrdineService,
    private router: Router
  ) {
    this.form = this.fb.group({
      via:             ['', Validators.required],
      civico:          ['', Validators.required],
      comune:          ['', Validators.required],
      cap:             ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      tipoSpedizione:  [TipoSpedizione.STANDARD, Validators.required],
      metodoPagamento: [MetodoPagamento.CARTA, Validators.required]
    });
  }

  ngOnInit(): void {
    this.carrelloService.items$.pipe(takeUntil(this.destroy$)).subscribe((items: CarrelloItem[]) => {
      this.items = items;
      this.totale = this.carrelloService.getTotale();
    });
    if (this.items.length === 0) this.router.navigate(['/cart']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  conferma(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.items.length === 0) return;

    this.loading = true;

    const indirizzo: Indirizzo = {
      id: 0,
      idUtente: 0,
      isDefault: false,
      paese: "IT",
      via: this.via.value,
      civico: this.civico.value,
      comune: this.comune.value,
      cap: this.cap.value,
    }

    this.ordineService.creaOrdineDaCarrello(
      this.items,
      this.metodoPagamento.value as MetodoPagamento,
      indirizzo,
      this.tipoSpedizione.value as TipoSpedizione,
    ).subscribe(() => {
      this.carrelloService.svuota();
      this.ordinato = true;
      this.loading = false;
    });
  }

  get via()             { return this.form.get('via')!; }
  get civico()          { return this.form.get('civico')!; }
  get comune()          { return this.form.get('comune')!; }
  get cap()             { return this.form.get('cap')!; }
  get tipoSpedizione()  { return this.form.get('tipoSpedizione')!; }
  get metodoPagamento() { return this.form.get('metodoPagamento')!; }
}