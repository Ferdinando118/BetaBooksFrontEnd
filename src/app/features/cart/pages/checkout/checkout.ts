import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CarrelloService } from '../../../../core/services/carrello';
import { OrdineService } from '../../../../core/services/ordine';
import { AuthService } from '../../../../core/services/auth';
import { ProfiloService } from '../../../../core/services/profilo';
import { LibroService } from '../../../../core/services/libro';

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
  private libroService = inject(LibroService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  
  items: CarrelloItemDTO[] = [];
  totale = 0;
  ordinato = false;
  loading = false;

  
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

  
  formCheckout: FormGroup;   
  formIndirizzo: FormGroup;  

  constructor() {
    
    this.formCheckout = this.fb.group({
      metodoPagamento: [MetodoPagamento.CARTA, Validators.required]
    });

    
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
    
    this.carrelloService.loadCarrello();
    this.carrelloService.carrello$.subscribe((data: CarrelloDTO | null) => {
      if (data && data.items && data.items.length > 0) {
        this.items = data.items;
        console.log(this.items);
        this.totale = data.prezzoTotaleComplessivo;
        
        this.items.forEach(item => {
          if (!item.formatiDisponibili) {
            item.formatiDisponibili = [];
          }
          this.caricaFormatiPerItem(item);
        });
        this.cdr.detectChanges();
      } else if (!this.ordinato) {
        this.router.navigate(['/cart']);
      }
    });

    
    this.caricaIndirizzi();
  }

  

  /**
   * Carica i formati disponibili per un item del carrello
   */
  caricaFormatiPerItem(item: CarrelloItemDTO): void {
    
    if (item.idLibro) {
      this.caricaFormatiByIdLibro(item);
      return;
    }

    
    if (item.idFormatoLibro) {
      this.libroService.getFormatoById(item.idFormatoLibro).subscribe({
        next: (formato: any) => {
          if (formato && formato.idLibro) {
            item.idLibro = formato.idLibro;
            this.caricaFormatiByIdLibro(item);
          }
        },
        error: (err) => console.error('Errore caricamento formato:', err)
      });
    }
  }

  /**
   * Carica i formati di un libro per ID
   */
  private caricaFormatiByIdLibro(item: CarrelloItemDTO): void {
    if (!item.idLibro) return;

    this.libroService.getFormatiByLibro(item.idLibro).subscribe({
      next: (formati: any[]) => {
        if (!formati || formati.length === 0) {
          console.warn('Nessun formato trovato per il libro:', item.idLibro);
          item.formatiDisponibili = [];
          return;
        }

        item.formatiDisponibili = formati.map((f: any) => ({
          id: f.id,
          tipoSupporto: f.tipoSupporto || 'Sconosciuto',
          tipoCopertina: f.tipoCopertina || 'Sconosciuto',
          prezzo: f.prezzo || 0
        }));
        
        
        const formatoCorrente = formati.find((f: any) => f.id === item.idFormatoLibro);
        if (formatoCorrente) {
          item.tipoSupporto = formatoCorrente.tipoSupporto;
          item.tipoCopertina = formatoCorrente.tipoCopertina;
          item.prezzoUnitario = formatoCorrente.prezzo;
        }

        console.log('Formati caricati per', item.titoloLibro, ':', item.formatiDisponibili);
      },
      error: (err) => {
        console.error('Errore caricamento formati per libro', item.idLibro, ':', err);
        item.formatiDisponibili = [];
      }
    });
  }

  /**
   * Gestore per il cambio di formato dal select
   */
  onFormatoChange(event: Event, item: CarrelloItemDTO): void {
    const target = event.target as HTMLSelectElement;
    if (!target || !target.value) return;
    
    const nuovoIdFormato = parseInt(target.value, 10);
    this.cambiaFormato(item, nuovoIdFormato);
  }

  /**
   * Cambia il formato di un item del carrello
   * @param item - L'item da modificare
   * @param nuovoIdFormato - L'ID del nuovo formato
   */
  cambiaFormato(item: CarrelloItemDTO, nuovoIdFormato: number): void {
    if (isNaN(nuovoIdFormato) || nuovoIdFormato === item.idFormatoLibro) {
      return; 
    }

    const nuovoFormato = item.formatiDisponibili?.find(f => f.id === nuovoIdFormato);
    if (!nuovoFormato) {
      console.error('Formato non trovato:', nuovoIdFormato);
      return;
    }

    
    this.carrelloService.rimuovi(item.id).subscribe({
      next: () => {
        
        this.carrelloService.aggiungi(nuovoIdFormato, item.quantita).subscribe({
          next: () => {
            console.log('Formato cambiato con successo');
            this.carrelloService.loadCarrello();
          },
          error: (err) => {
            console.error('Errore durante l\'aggiunta:', err);
            alert('Errore durante l\'aggiunta: ' + (err.error?.message || 'Errore sconosciuto'));
            this.carrelloService.loadCarrello(); 
          }
        });
      },
      error: (err) => {
        console.error('Errore durante la rimozione:', err);
        alert('Errore durante la rimozione: ' + (err.error?.message || 'Errore sconosciuto'));
        this.carrelloService.loadCarrello(); 
      }
    });
  }

  

  caricaIndirizzi(): void {
    const utente = this.auth.grant().utente;
    if (!utente) return;

    this.loadingIndirizzi = true;
    this.profiloService.findIndirizziByUser(utente.id).subscribe({
      next: (list: Indirizzo[]) => {
        this.indirizzi = list || [];
        this.loadingIndirizzi = false;

        if (this.indirizzi.length > 0) {
          
          const def = this.indirizzi.find(i => i.isDefault);
          this.indirizzoSelezionato = def ? def.id! : this.indirizzi[0].id!;
          this.mostraNuovoIndirizzo = false;
        } else {
          
          this.mostraNuovoIndirizzo = true;
        }
        this.cdr.detectChanges();
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
      this.indirizzoSelezionato = null; 
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
      isDefault: isFirst 
    };

    this.profiloService.saveIndirizzo(nuovoIndirizzo).subscribe({
      next: () => {
        
        this.caricaIndirizzi();
      },
      error: (err: any) => {
        console.error("Errore salvataggio indirizzo:", err);
        this.loadingIndirizzi = false;
        alert("Impossibile salvare l'indirizzo.");
      }
    });
  }

  

  conferma(): void {
    
    if (this.formCheckout.invalid) { 
      this.formCheckout.markAllAsTouched(); 
      return; 
    }
    
    
    if (!this.indirizzoSelezionato) {
      alert("Attenzione: Seleziona o aggiungi un indirizzo di spedizione prima di procedere.");
      return;
    }

    const utente = this.auth.grant().utente;
    if (!utente) return;

    this.loading = true;

    
    this.ordineService.checkout(
      utente.id, 
      this.formCheckout.value.metodoPagamento, 
      this.indirizzoSelezionato
    ).subscribe({
      next: (res: Resp) => {
        this.ordinato = true; 
        this.loading = false;
        this.carrelloService.loadCarrello(); 
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error("Errore:", err);
        this.loading = false;
        alert("Errore: " + (err.error?.message || "Impossibile completare l'ordine"));
        this.cdr.detectChanges();
      }
    });
  }
}