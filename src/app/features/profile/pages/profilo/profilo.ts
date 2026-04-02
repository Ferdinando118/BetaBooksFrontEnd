import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { ProfiloService } from '../../../../core/services/profilo';
import { Utente, ProfiloUtente, Indirizzo } from '../../../../core/models/models';

@Component({
  selector: 'app-profilo',
  standalone: false,
  templateUrl: './profilo.html',
  styleUrl: './profilo.css'
})
export class Profilo implements OnInit {
  utente: Utente | null = null;
  profiloEsistente: ProfiloUtente | null = null;
  indirizzi: Indirizzo[] = []; // Ora è un array per gestire la rubrica!

  // Due form separati!
  formProfilo: FormGroup;
  formIndirizzo: FormGroup;

  // Stati
  loadingProfilo = false;
  salvatoProfilo = false;
  
  mostraFormIndirizzo = false;
  loadingIndirizzo = false;
  indirizzoInModifica: Indirizzo | null = null;

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private profiloService: ProfiloService
  ) {
    // FORM 1: ANAGRAFICA
    this.formProfilo = this.fb.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      telefono: ['']
    });

    // FORM 2: INDIRIZZO (corretto "citta" in "comune"!)
    this.formIndirizzo = this.fb.group({
      via: ['', Validators.required],
      civico: ['', Validators.required],
      comune: ['', Validators.required], 
      cap: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
      provincia: ['', [Validators.required, Validators.maxLength(2)]],
      paese: ['Italia', Validators.required],
      noteConsegna: ['']
    });
  }

  ngOnInit(): void {
    this.utente = this.auth.grant().utente;
    if (this.utente?.id) {
      this.caricaDati();
    }
  }

  caricaDati() {
    const idUtente = this.utente!.id;

    // 1. Carica Anagrafica
    this.profiloService.findByUtente(idUtente).subscribe(p => {
      if (p) {
        this.profiloEsistente = p;
        this.formProfilo.patchValue({ nome: p.nome, cognome: p.cognome, telefono: p.telefono });
      }
    });

    // 2. Carica Lista Indirizzi
    this.caricaIndirizzi();
  }

  caricaIndirizzi() {
    this.profiloService.findIndirizziByUser(this.utente!.id).subscribe(list => {
      this.indirizzi = list || [];
    });
  }

  // ─── GESTIONE PROFILO ──────────────────────────────────────────────

  salvaProfilo(): void {
    if (this.formProfilo.invalid) return;
    this.loadingProfilo = true;
    const val = this.formProfilo.value;

    const pReq = {
      ...this.profiloEsistente,
      nome: val.nome,
      cognome: val.cognome,
      telefono: val.telefono,
      idUtente: this.utente!.id
    } as ProfiloUtente;

    this.profiloService.saveProfilo(pReq).subscribe(() => {
      this.loadingProfilo = false;
      this.salvatoProfilo = true;
      setTimeout(() => this.salvatoProfilo = false, 3000);
    });
  }

  // ─── GESTIONE RUBRICA INDIRIZZI ────────────────────────────────────

  apriFormIndirizzo(indirizzo?: Indirizzo) {
    this.mostraFormIndirizzo = true;
    if (indirizzo) {
      // Modalità Modifica
      this.indirizzoInModifica = indirizzo;
      this.formIndirizzo.patchValue(indirizzo);
    } else {
      // Modalità Nuovo
      this.indirizzoInModifica = null;
      this.formIndirizzo.reset({ paese: 'Italia' });
    }
  }

  chiudiFormIndirizzo() {
    this.mostraFormIndirizzo = false;
    this.indirizzoInModifica = null;
  }

  salvaIndirizzo() {
    if (this.formIndirizzo.invalid) return;
    this.loadingIndirizzo = true;
    const val = this.formIndirizzo.value;

    // Se è il primo indirizzo che aggiunge, lo rendiamo Predefinito
    const isDefault = this.indirizzi.length === 0 || (this.indirizzoInModifica?.isDefault ?? false);

    const iReq = {
      ...this.indirizzoInModifica,
      via: val.via,
      civico: val.civico,
      comune: val.comune,
      cap: val.cap,
      provincia: val.provincia,
      paese: val.paese,
      noteConsegna: val.noteConsegna,
      idUtente: this.utente!.id,
      isDefault: isDefault
    } as Indirizzo;

    this.profiloService.saveIndirizzo(iReq).subscribe(() => {
      this.loadingIndirizzo = false;
      this.chiudiFormIndirizzo();
      this.caricaIndirizzi(); // Ricarichiamo la rubrica dal database!
    });
  }

eliminaIndirizzo(id: number) {
    if (confirm("Vuoi davvero eliminare questo indirizzo?")) {
      // Ora chiamiamo davvero il backend!
      this.profiloService.deleteIndirizzo(id).subscribe({
        next: () => {
          // Quando Java ci risponde (con il 204 No Content), ricarichiamo la rubrica
          this.caricaIndirizzi();
        },
        error: (err) => {
          console.error("Errore durante l'eliminazione", err);
          alert("Ops! Non è stato possibile eliminare l'indirizzo.");
        }
      });
    }
  }
}