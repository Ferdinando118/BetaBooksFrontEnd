import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  constructor() {
    this.form = this.fb.group({
      titolo: ['', [Validators.required, Validators.minLength(3)]],
      descrizione: ['', Validators.required],
      idAutore: [null, Validators.required],
      idEditore: [null, Validators.required],
      idCategorie: [[]],
      prezzo: [1.0, [Validators.required, Validators.min(0.01)]], 
      stock: [1, [Validators.required, Validators.min(1)]],
      tipoSupporto: ['CARTACEO', Validators.required],
      tipoCopertina: ['FLESSIBILE', Validators.required]
    });
  }

  ngOnInit() {
    this.caricaAnagrafiche();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.idLibro = Number(id);
      this.caricaDatiLibro(this.idLibro);
    }
  }

  caricaAnagrafiche() {
    this.autoreService.getAll().subscribe(data => this.autori.set(data));
    this.editoreService.getAll().subscribe(data => this.editori.set(data));
    this.categoriaService.getAll().subscribe(data => this.categorie.set(data));
  }

  caricaDatiLibro(id: number) {
    this.libroService.getById(id).subscribe({
      next: (res: any) => {
        // Se il libro ha già dei formati, popoliamo i campi prezzo/stock con il primo disponibile
        const primoFormato = res.formati?.[0];
        
        this.form.patchValue({
          titolo: res.titolo,
          descrizione: res.descrizione,
          idAutore: res.autore?.id_autore || res.autore?.id, 
          idEditore: res.editore?.id_editore || res.editore?.id, 
          idCategorie: res.categorie?.map((c: any) => c.id_categoria || c.id) || [],
          prezzo: primoFormato?.prezzo || 1.0,
          stock: primoFormato?.quantita || 1,
          tipoSupporto: primoFormato?.tipoSupporto || 'CARTACEO',
          tipoCopertina: primoFormato?.tipoCopertina || 'FLESSIBILE'
        });
      }
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
  }

salva() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.loading = true;

  const libroData: LibroReq = {
    titolo: this.form.value.titolo,
    descrizione: this.form.value.descrizione,
    idAutore: Number(this.form.value.idAutore),
    idEditore: Number(this.form.value.idEditore),
    idCategorie: this.form.value.idCategorie?.map((id: any) => Number(id)) || [],
    tipoSupporto: this.form.value.tipoSupporto,
    tipoCopertina: this.form.value.tipoCopertina,
    prezzo: this.form.value.prezzo,
    quantita: this.form.value.stock, 
    isbn: '' 
  };

  if (this.editMode) {
    libroData.id = this.idLibro;
    this.libroService.update(libroData).subscribe({
      next: () => this.finalizza(),
      error: (err) => this.gestisciErrore(err)
    });
  } else {
    // 1. Creazione del LIBRO
    this.libroService.create(libroData).subscribe({
      next: (res: any) => {
        const nuovoIdLibro = res.obj; // ID del libro appena creato
        if (nuovoIdLibro) {
          // 2. Creazione del FORMATO (dove risiedono prezzo e quantità)
          this.creaFormatoECaricaImmagine(nuovoIdLibro);
        } else {
          this.gestisciErrore({ error: { message: "ID Libro non ricevuto dal server." } });
        }
      },
      error: (err) => this.gestisciErrore(err)
    });
  }
}

private creaFormatoECaricaImmagine(idLibro: number) {
  // Prepariamo l'oggetto per il formato
  // Usiamo 'any' o LibroReq perché il tuo controller Java accetta LibroReq come Body
  const formatoData: any = {
    idLibro: idLibro,
    titolo: this.form.value.titolo,
    idAutore: Number(this.form.value.idAutore),
    idEditore: Number(this.form.value.idEditore),
    prezzo: this.form.value.prezzo,
    quantita: this.form.value.stock, // Assicurati che si chiami 'quantita' per il backend
    tipoSupporto: this.form.value.tipoSupporto,
    tipoCopertina: this.form.value.tipoCopertina,
    attivo: true
  };

  this.libroService.createFormato(idLibro, formatoData).subscribe({
    next: (resFormato: any) => {
      const idDelFormato = resFormato.obj; // ID del formato per l'immagine

      if (this.selectedFile && idDelFormato) {
        // 3. Upload Immagine se presente
        this.libroService.uploadCopertina(idDelFormato, this.selectedFile).subscribe({
          next: () => this.finalizza(),
          error: (err) => this.gestisciErrore(err)
        });
      } else {
        this.finalizza();
      }
    },
    error: (err) => {
      console.error("Errore durante la creazione del formato:", err);
      this.gestisciErrore(err);
    }
  });
}

  private finalizza() {
    this.loading = false;
    alert("Operazione completata con successo!");
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