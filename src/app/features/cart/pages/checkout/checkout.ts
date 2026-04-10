import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CarrelloService } from '../../../../core/services/carrello';
import { OrdineService } from '../../../../core/services/ordine';
import { AuthService } from '../../../../core/services/auth';
import { ProfiloService } from '../../../../core/services/profilo'; // <-- Aggiunto per gli indirizzi

import { CarrelloDTO, CarrelloItemDTO, MetodoPagamento, Indirizzo, Resp } from '../../../../core/models/models';

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {
  private fb = inject(FormBuilder);
  private carrelloService = inject(CarrelloService);
  private ordineService = inject(OrdineService);
  private auth = inject(AuthService);
  private profiloService = inject(ProfiloService);
  private router = inject(Router);

  // --- STATO CARRELLO E ORDINE ---
  items: CarrelloItemDTO[] = [];
  totale = 0;
  ordinato = false;
  loading = false;

  // --- STATO INDIRIZZI ---
  indirizzi: Indirizzo[] = [];
  indirizzoSelezionato: number | null = null;
  mostraNuovoIndirizzo = false;
  loadingIndirizzi = false;

  metodi = [
    { value: MetodoPagamento.CARTA,    label: '💳 Carta di credito' },
    { value: MetodoPagamento.PAYPAL,   label: '🅿️ PayPal' },
    { value: MetodoPagamento.CONSEGNA, label: '🚪 Contrassegno' },
    { value: MetodoPagamento.BONIFICO, label: '🏦 Bonifico' }
  ];

  // --- FORM SEPARATI ---
  formCheckout: FormGroup;   // Solo per il metodo di pagamento
  formIndirizzo: FormGroup;  // Solo per il nuovo indirizzo

  constructor() {
    // Form per confermare l'ordine
    this.formCheckout = this.fb.group({
      metodoPagamento: [MetodoPagamento.CARTA, Validators.required]
    });

    // Form per creare un nuovo indirizzo (identico a quello del profilo)
    this.formIndirizzo = this.fb.group({
      via: ['', Validators.required],
      civico: ['', Validators.required],
      comune: ['', Validators.required],
      cap: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      provincia: ['', [Validators.required, Validators.maxLength(2)]],
      paese: ['Italia', Validators.required],
      noteConsegna: ['']
    });
  }

  ngOnInit(): void {
    // 1. Carica il Carrello
    this.carrelloService.loadCarrello();
    this.carrelloService.carrello$.subscribe((data: CarrelloDTO | null) => {
      if (data && data.items && data.items.length > 0) {
        this.items = data.items;
        this.totale = data.prezzoTotaleComplessivo;
      } else if (!this.ordinato) {
        this.router.navigate(['/cart']);
      }
    });

    // 2. Carica gli Indirizzi dell'utente
    this.caricaIndirizzi();
  }

  // ─── GESTIONE INDIRIZZI ──────────────────────────────────────────────

  caricaIndirizzi(): void {
    const utente = this.auth.grant().utente;
    if (!utente) return;

    this.loadingIndirizzi = true;
    this.profiloService.findIndirizziByUser(utente.id).subscribe({
      next: (list: Indirizzo[]) => {
        this.indirizzi = list || [];
        this.loadingIndirizzi = false;

        if (this.indirizzi.length > 0) {
          // Pre-seleziona l'indirizzo predefinito (o il primo della lista)
          const def = this.indirizzi.find(i => i.isDefault);
          this.indirizzoSelezionato = def ? def.id! : this.indirizzi[0].id!;
          this.mostraNuovoIndirizzo = false;
        } else {
          // Se non ha indirizzi, forziamo l'apertura del form
          this.mostraNuovoIndirizzo = true;
        }
      },
      error: (err: any) => {
        console.error("Errore recupero indirizzi:", err);
        this.loadingIndirizzi = false;
      }
    });
  }

  selezionaIndirizzo(id: number): void {
    this.indirizzoSelezionato = id;
    this.mostraNuovoIndirizzo = false;
  }

  toggleNuovoIndirizzo(): void {
    this.mostraNuovoIndirizzo = !this.mostraNuovoIndirizzo;
    if (this.mostraNuovoIndirizzo) {
      this.indirizzoSelezionato = null; // Deseleziona gli altri
      this.formIndirizzo.reset({ paese: 'Italia' });
    }
  }

  salvaNuovoIndirizzo(): void {
    if (this.formIndirizzo.invalid) {
      this.formIndirizzo.markAllAsTouched();
      return;
    }

    const utente = this.auth.grant().utente;
    if (!utente) return;

    this.loadingIndirizzi = true;
    const isFirst = this.indirizzi.length === 0;

    const nuovoIndirizzo: Indirizzo = {
      ...this.formIndirizzo.value,
      idUtente: utente.id,
      isDefault: isFirst // Rende predefinito se è l'unico
    };

    this.profiloService.saveIndirizzo(nuovoIndirizzo).subscribe({
      next: () => {
        // Ricarica la lista dal database. caricaIndirizzi() imposterà anche l'ID selezionato!
        this.caricaIndirizzi();
      },
      error: (err: any) => {
        console.error("Errore salvataggio indirizzo:", err);
        this.loadingIndirizzi = false;
        alert("Impossibile salvare l'indirizzo.");
      }
    });
  }

  // ─── GESTIONE CHECKOUT ───────────────────────────────────────────────

  conferma(): void {
    // Controlla che il form del pagamento sia valido
    if (this.formCheckout.invalid) { 
      this.formCheckout.markAllAsTouched(); 
      return; 
    }
    
    // Ferma tutto se l'utente non ha scelto/creato un indirizzo
    if (!this.indirizzoSelezionato) {
      alert("Attenzione: Seleziona o aggiungi un indirizzo di spedizione prima di procedere.");
      return;
    }

    const utente = this.auth.grant().utente;
    if (!utente) return;

    this.loading = true;

    // Chiamata all'API con l'indirizzo REALE scelto dall'utente!
    this.ordineService.checkout(
      utente.id, 
      this.formCheckout.value.metodoPagamento, 
      this.indirizzoSelezionato
    ).subscribe({
      next: (res: Resp) => {
        this.ordinato = true; 
        this.loading = false;
        this.carrelloService.loadCarrello(); 
      },
      error: (err: any) => {
        console.error("Errore:", err);
        this.loading = false;
        alert("Errore: " + (err.error?.message || "Impossibile completare l'ordine"));
      }
    });
  }
}