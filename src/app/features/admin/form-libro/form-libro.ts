import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormatoLibroReq, LibroReq, LibroService } from '../../../core/services/libro';
import { AutoreService } from '../../../core/services/autore';
import { EditoreService } from '../../../core/services/editore';
import { CategoriaService } from '../../../core/services/categoria';

@Component({
  selector: 'app-form-libro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './form-libro.html',
  styleUrl: './form-libro.css'
})
export class FormLibro implements OnInit {
  private autoreService = inject(AutoreService);
  private editoreService = inject(EditoreService);
  private categoriaService = inject(CategoriaService);
  private fb = inject(FormBuilder);
  private libroService = inject(LibroService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form: FormGroup;
  editMode = false;
  idLibro?: number;
  loading = false;
  selectedFile: File | null = null;

  autori = signal<any[]>([]);
  editori = signal<any[]>([]);
  categorie = signal<any[]>([]);
  formatiEsistenti = signal<any[]>([]);

  // Tipi di supporto e copertina
  tipiSupporto = [
    { value: 'CARTACEO', label: 'Cartaceo' },
    { value: 'EBOOK', label: 'E-book' }
  ];

  tipiCopertina = [
    { value: 'FLESSIBILE', label: 'Copertina flessibile' },
    { value: 'RIGIDA', label: 'Copertina rigida' }
  ];

  constructor() {
    this.form = this.fb.group({
      titolo: ['', [Validators.required, Validators.minLength(3)]],
      descrizione: ['', Validators.required],
      idAutore: [null, Validators.required],
      idEditore: [null, Validators.required],
      idCategorie: [[]],
      formati: this.fb.array([])
    });
  }

  ngOnInit() {
    this.caricaAnagrafiche();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.idLibro = Number(id);
      this.caricaDatiLibro(this.idLibro);
    } else {
      // In modalità creazione, aggiungi i 3 formati predefiniti
      this.aggiungiFormatoPredefinito('CARTACEO', 'FLESSIBILE');
      this.aggiungiFormatoPredefinito('CARTACEO', 'RIGIDA');
      this.aggiungiFormatoPredefinito('EBOOK', 'FLESSIBILE');
    }
  }

  get formati(): FormArray {
    return this.form.get('formati') as FormArray;
  }

  creaFormatiGroup(id?: number, tipoSupporto = 'CARTACEO', tipoCopertina = 'FLESSIBILE', prezzo = 1.0, quantita = 1): FormGroup {
    return this.fb.group({
      id: [id],
      tipoSupporto: [tipoSupporto, Validators.required],
      tipoCopertina: [tipoCopertina, Validators.required],
      prezzo: [prezzo, [Validators.required, Validators.min(0.01)]],
      quantita: [quantita, [Validators.required, Validators.min(1)]],
      attivo: [true]
    });
  }

  aggiungiFormatoPredefinito(tipoSupporto: string, tipoCopertina: string): void {
    const label = this.getEtichettaFormato(tipoSupporto, tipoCopertina);
    // Controlla che non esista già un formato con questa combinazione
    const esiste = this.formati.value.some((f: any) => 
      f.tipoSupporto === tipoSupporto && f.tipoCopertina === tipoCopertina
    );
    
    if (!esiste) {
      this.formati.push(this.creaFormatiGroup(undefined, tipoSupporto, tipoCopertina));
    }
  }

  rimuoviFormato(index: number): void {
    this.formati.removeAt(index);
  }

  getEtichettaFormato(tipoSupporto: string, tipoCopertina: string): string {
    const supporto = this.tipiSupporto.find(s => s.value === tipoSupporto)?.label || tipoSupporto;
    const copertina = this.tipiCopertina.find(c => c.value === tipoCopertina)?.label || tipoCopertina;
    return `${supporto} - ${copertina}`;
  }

  getFormatoGroup(index: number): FormGroup {
    return this.formati.at(index) as FormGroup;
  }

  hasFormatoCartaceo(): boolean {
    return this.formati.value.some((f: any) => f.tipoSupporto === 'CARTACEO');
  }

  caricaAnagrafiche() {
    this.autoreService.getAll().subscribe(data => this.autori.set(data));
    this.editoreService.getAll().subscribe(data => this.editori.set(data));
    this.categoriaService.getAll().subscribe(data => this.categorie.set(data));
  }

  caricaDatiLibro(id: number) {
    this.libroService.getById(id).subscribe({
      next: (res: any) => {
        this.form.patchValue({
          titolo: res.titolo,
          descrizione: res.descrizione,
          idAutore: res.autore?.id_autore || res.autore?.id, 
          idEditore: res.editore?.id_editore || res.editore?.id, 
          idCategorie: res.categorie?.map((c: any) => c.id_categoria || c.id) || []
        });

        // Carica i formati esistenti
        if (res.formati && res.formati.length > 0) {
          this.formatiEsistenti.set(res.formati);
          // Popola il FormArray con i formatieistenti
          res.formati.forEach((f: any) => {
            this.formati.push(this.creaFormatiGroup(
              f.id,
              f.tipoSupporto,
              f.tipoCopertina,
              f.prezzo,
              f.quantita
            ));
          });
        } else {
          // Se nessun formato esiste, aggiungi i 3 predefiniti
          this.aggiungiFormatoPredefinito('CARTACEO', 'FLESSIBILE');
          this.aggiungiFormatoPredefinito('CARTACEO', 'RIGIDA');
          this.aggiungiFormatoPredefinito('EBOOK', 'FLESSIBILE');
        }
      }
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
  }

  salva() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    alert("Il form contiene errori. Ricontrollare i dati inseriti.");
    return;
  }

  if (this.formati.length === 0) {
    alert("Aggiungi almeno un formato al libro.");
    return;
  }

  this.loading = true;

  const libroData: LibroReq = {
    titolo: this.form.value.titolo,
    descrizione: this.form.value.descrizione,
    idAutore: Number(this.form.value.idAutore),
    idEditore: Number(this.form.value.idEditore),
    idCategorie: this.form.value.idCategorie?.map((id: any) => Number(id)) || [],
    tipoSupporto: 'CARTACEO', // Questo non viene più usato per singolo libro
    tipoCopertina: 'FLESSIBILE', // Questo non viene più usato per singolo libro
    prezzo: 0, // Sarà fornito dai singoli formati
    quantita: 0, // Sarà fornito dai singoli formati
    isbn: '' 
  };

  if (this.editMode) {
    libroData.id = this.idLibro;
    this.libroService.update(libroData).subscribe({
      next: () => this.salvaFormati(),
      error: (err) => this.gestisciErrore(err)
    });
  } else {
    // 1. Creazione del LIBRO
    this.libroService.create(libroData).subscribe({
      next: (res: any) => {
        const nuovoIdLibro = res.obj; // ID del libro appena creato
        if (nuovoIdLibro) {
          this.idLibro = nuovoIdLibro;
          // 2. Creazione dei FORMATI
          this.salvaFormati();
        } else {
          this.gestisciErrore({ error: { message: "ID Libro non ricevuto dal server." } });
        }
      },
      error: (err) => this.gestisciErrore(err)
    });
  }
}

private salvaFormati(): void {
  const formatiDaSalvare = this.formati.value as any[];
  let contatoreSalvati = 0;
  let contatoreFalliti = 0;

  if (formatiDaSalvare.length === 0) {
    this.finalizza();
    return;
  }

  formatiDaSalvare.forEach((formato, index) => {
    const formatoData: FormatoLibroReq = {
      id: formato.id,
      idLibro: this.idLibro!,
      tipoSupporto: formato.tipoSupporto,
      tipoCopertina: formato.tipoCopertina,
      prezzo: formato.prezzo,
      quantita: formato.quantita,
      attivo: formato.attivo
    };

    const operazione = formato.id 
      ? this.libroService.updateFormato(formatoData) 
      : this.libroService.createFormato(this.idLibro!, formatoData);

    operazione.subscribe({
      next: (res: any) => {
        contatoreSalvati++;
        // Se è il primo formato e abbiamo un file, carica l'immagine
        if (index === 0 && this.selectedFile && res.obj) {
          this.libroService.uploadCopertina(res.obj, this.selectedFile).subscribe({
            next: () => {
              if (contatoreSalvati === formatiDaSalvare.length) {
                this.finalizza();
              }
            },
            error: (err) => {
              console.error('Errore upload immagine:', err);
              if (contatoreSalvati + contatoreFalliti === formatiDaSalvare.length) {
                this.finalizza();
              }
            }
          });
        } else if (contatoreSalvati === formatiDaSalvare.length) {
          this.finalizza();
        }
      },
      error: (err) => {
        contatoreFalliti++;
        console.error(`Errore salvataggio formato ${index}:`, err);
        if (contatoreSalvati + contatoreFalliti === formatiDaSalvare.length) {
          this.finalizza();
        }
      }
    });
  });
}

  private finalizza() {
    this.loading = false;
    alert("Libro e formati salvati con successo!");
    this.router.navigate(['/catalogo']);
  }

  private gestisciErrore(err: any) {
    this.loading = false;
    console.error("Dettaglio Errore:", err);
    // Mostra il messaggio d'errore che arriva dal backend (classe Resp)
    const messaggio = err.error?.message || "Errore imprevisto durante il salvataggio";
    alert("Attenzione: " + messaggio);
  }
}