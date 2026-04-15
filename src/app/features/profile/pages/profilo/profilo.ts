import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { ProfiloService } from '../../../../core/services/profilo';
import { Utente, ProfiloUtente, Indirizzo } from '../../../../core/models/models';
import { ChangeDetectorRef } from '@angular/core';
import { RecensioneService } from '../../../../core/services/recensione';

@Component({
  selector: 'app-profilo',
  standalone: false,
  templateUrl: './profilo.html',
  styleUrl: './profilo.css',
})
export class Profilo implements OnInit {
  private readonly STORAGE_KEY = 'formIndirizzo_draft';
  private readonly STORAGE_MODIFICA_KEY = 'indirizzoInModifica_draft';

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

  // Modale di conferma eliminazione
  mostraModalEliminazione = false;
  indirizzoInEliminazione: number | null = null;

  //proprietà per il cambio pwd
  mostraDialogPassword = false;
  errorePassword = '';
  successoPassword = false;

  regexTelefono = /^[0-9]{10}$/;
  regexPrefisso = /^\+[0-9]{2}$/;
  errors = '';

  recensioni: any[] = [];

  formPassword = {
    vecchiaPassword: '',
    nuovaPassword: '',
    confermaPassword: '',
  };

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private profiloService: ProfiloService,
    private cdr: ChangeDetectorRef,
    private recensioneService: RecensioneService,
  ) {
    // FORM 1: ANAGRAFICA
    this.formProfilo = this.fb.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      telefono: [''],
      prefisso: [''],
    });

    // FORM 2: INDIRIZZO (corretto "citta" in "comune"!)
    this.formIndirizzo = this.fb.group({
      via: ['', Validators.required],
      civico: ['', Validators.required],
      comune: ['', Validators.required],
      cap: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
      provincia: ['', [Validators.required, Validators.maxLength(2)]],
      paese: ['Italia', Validators.required],
      noteConsegna: [''],
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
    this.profiloService.findByUtente(idUtente).subscribe((p) => {
      console.log('Profilo caricato:', p);
      if (p) {
        this.profiloEsistente = p;
        this.formProfilo.patchValue({
          nome: p.nome,
          cognome: p.cognome,
          prefisso: p.telefono?.substring(0, 3),
          telefono: p.telefono?.substring(3),
        });
        console.log('Chiamo caricaRecensioni con idProfilo:', p.id);
         this.caricaRecensioni();
      }
    });

    // 2. Carica Lista Indirizzi
    this.caricaIndirizzi();

    // 3. Carica draft del form indirizzo da localStorage
    this.caricaFormDraft();

   
    
  }

  caricaIndirizzi() {
    this.profiloService.findIndirizziByUser(this.utente!.id).subscribe((list) => {
      this.indirizzi = list || [];

      this.cdr.detectChanges();
    });
  }

  // ─── GESTIONE PROFILO ──────────────────────────────────────────────

  salvaProfilo(): void {
    if (this.formProfilo.invalid) return;

    this.errors = '';
    this.loadingProfilo = true;
    const val = this.formProfilo.value;

    if (!this.regexTelefono.test(val.telefono)) {
      this.loadingProfilo = false;
      //alert('Il numero di telefono deve contenere esattamente 10 cifre numeriche');
      this.errors = 'Il numero di telefono deve contenere esattamente 10 cifre numeriche';
      return;
    }

    if (!this.regexPrefisso.test(val.prefisso)) {
      this.loadingProfilo = false;
      this.errors = 'Il prefisso deve essere nel formato +39';
      return;
    }

    const telefonoCompleto = val.prefisso.trim() + val.telefono.trim();

    const pReq = {
      ...this.profiloEsistente,
      nome: val.nome,
      cognome: val.cognome,
      telefono: telefonoCompleto,
      idUtente: this.utente!.id,
    } as ProfiloUtente;

    this.profiloService.saveProfilo(pReq).subscribe(() => {
      this.loadingProfilo = false;
      this.salvatoProfilo = true;
      this.profiloEsistente = pReq; // <--- Aggiorna i dati locali con quelli appena salvati

      this.cdr.detectChanges(); // <--- AGGIUNGI QUESTO QUI!

      setTimeout(() => {
        this.salvatoProfilo = false;
        this.cdr.detectChanges(); // <--- Serve anche qui per far sparire il messaggio "✅ Profilo salvato!"
      }, 3000);
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
    // Salva il draft quando apri il form
    this.salvaFormDraft();
  }

  chiudiFormIndirizzo() {
    this.mostraFormIndirizzo = false;
    this.indirizzoInModifica = null;
    // Pulisci il draft quando chiudi il form
    this.pulisciFormDraft();
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
      isDefault: isDefault,
    } as Indirizzo;

    this.profiloService.saveIndirizzo(iReq).subscribe(() => {
      this.loadingIndirizzo = false;
      // Pulisci il draft dopo il salvataggio
      this.pulisciFormDraft();
      this.chiudiFormIndirizzo();
      this.caricaIndirizzi(); // Ricarichiamo la rubrica dal database!
    });
  }

  eliminaIndirizzo(id: number) {
    this.indirizzoInEliminazione = id;
    this.mostraModalEliminazione = true;
  }

  confermaEliminazione() {
    if (this.indirizzoInEliminazione) {
      this.profiloService.deleteIndirizzo(this.indirizzoInEliminazione).subscribe({
        next: () => {
          this.caricaIndirizzi();
          this.chiudiModalEliminazione();
        },
        error: (err) => {
          console.error("Errore durante l'eliminazione", err);
          alert("Ops! Non è stato possibile eliminare l'indirizzo.");
          this.chiudiModalEliminazione();
        },
      });
    }
  }

  chiudiModalEliminazione() {
    this.mostraModalEliminazione = false;
    this.indirizzoInEliminazione = null;
    // Mantieni il draft del form anche quando chiudi la modale
  }

  // ─── METODI PERSISTENZA FORM (localStorage) ────────────────────────

  private caricaFormDraft(): void {
    const formDraft = localStorage.getItem(this.STORAGE_KEY);
    const modicaDraft = localStorage.getItem(this.STORAGE_MODIFICA_KEY);

    if (formDraft) {
      try {
        const datiSalvati = JSON.parse(formDraft);
        this.mostraFormIndirizzo = true;
        this.formIndirizzo.patchValue(datiSalvati);

        if (modicaDraft) {
          this.indirizzoInModifica = JSON.parse(modicaDraft);
        }
      } catch (e) {
        console.error('Errore nel caricamento del draft', e);
        this.pulisciFormDraft();
      }
    }
  }

  private salvaFormDraft(): void {
    const formData = this.formIndirizzo.value;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(formData));

    if (this.indirizzoInModifica) {
      localStorage.setItem(this.STORAGE_MODIFICA_KEY, JSON.stringify(this.indirizzoInModifica));
    }
  }

  private pulisciFormDraft(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STORAGE_MODIFICA_KEY);
  }

  // GESTIONE CAMBIO PWD

  apriDialogPassword(): void {
    console.log('APRI DIALOG CHIAMATO');
    this.mostraDialogPassword = true;
    this.errorePassword = '';
    this.successoPassword = false;
    this.formPassword = { vecchiaPassword: '', nuovaPassword: '', confermaPassword: '' };
  }

  chiudiDialogPassword(): void {
    this.mostraDialogPassword = false;
  }

  salvaPassword(): void {
    this.errorePassword = '';

    if (
      !this.formPassword.vecchiaPassword ||
      !this.formPassword.nuovaPassword ||
      !this.formPassword.confermaPassword
    ) {
      this.errorePassword = 'Compila tutti i campi.';
      return;
    }

    if (this.formPassword.nuovaPassword !== this.formPassword.confermaPassword) {
      this.errorePassword = 'Le password non coincidono.';
      return;
    }

    const email = this.auth.grant().utente?.email;
    if (!email) return;

    this.auth
      .cambiaPassword({
        email,
        oldPwd: this.formPassword.vecchiaPassword,
        newPwd: this.formPassword.nuovaPassword,
      })
      .subscribe({
        next: () => {
          this.successoPassword = true;
          this.cdr.detectChanges(); // forza il render

          setTimeout(() => {
            this.auth.logout();
          }, 2000);
        },
        error: (err) => {
          this.errorePassword = err.error?.message ?? 'Errore durante il cambio password.';
        },
      });
  }

  caricaRecensioni(): void {
    console.log('profiloEsistente:', this.profiloEsistente);
    if (!this.profiloEsistente?.id ) return;

    this.recensioneService.getByProfilo(this.profiloEsistente?.id).subscribe({
      next: (res) => {
        console.log('Recensioni ricevute:', res);
        this.recensioni = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore caricamento recensioni', err);
      },
    });

  }
}
