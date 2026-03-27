import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CarrelloService } from '../../../../core/services/carrello';
import { CarrelloItem, MetodoPagamento } from '../../../../core/models/models';

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {
  form: FormGroup;
  items: CarrelloItem[] = [];
  totale = 0;
  ordinato = false;
  loading = false;

  metodi = [
    { value: MetodoPagamento.CARTA,     label: '💳 Carta di credito' },
    { value: MetodoPagamento.PAYPAL,    label: '🅿️ PayPal' },
    { value: MetodoPagamento.CONSEGNA,  label: '🚪 Contrassegno' },
    { value: MetodoPagamento.BONIFICO,  label: '🏦 Bonifico' }
  ];

  constructor(
    private fb: FormBuilder,
    private carrelloService: CarrelloService,
    private router: Router
  ) {
    this.form = this.fb.group({
      via:             ['', Validators.required],
      civico:          ['', Validators.required],
      comune:          ['', Validators.required],
      cap:             ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      metodoPagamento: [MetodoPagamento.CARTA, Validators.required]
    });
  }

  ngOnInit(): void {
    this.carrelloService.items$.subscribe((items: CarrelloItem[]) => {
      this.items = items;
      this.totale = this.carrelloService.getTotale();
    });
    if (this.items.length === 0) this.router.navigate(['/cart']);
  }

  conferma(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    setTimeout(() => {
      this.carrelloService.svuota();
      this.ordinato = true;
      this.loading = false;
    }, 1200);
  }

  get via()             { return this.form.get('via')!; }
  get civico()          { return this.form.get('civico')!; }
  get comune()          { return this.form.get('comune')!; }
  get cap()             { return this.form.get('cap')!; }
  get metodoPagamento() { return this.form.get('metodoPagamento')!; }
}