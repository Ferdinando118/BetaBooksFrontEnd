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
  
  // NUOVO: Usiamo una Map per tenere traccia del file caricato per ogni indice del FormArray
  selectedFiles = new Map<number, File>();

  autori = signal<any[]>([]);
  editori = signal<any[]>([]);
  categorie = signal<any[]>([]);
  formatiEsistenti = signal<any[]>([]);

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
      idCategorie: [[], Validators.required], 
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
      this.aggiungiFormatoPredefinito('CARTACEO', 'FLESSIBILE');
      this.aggiungiFormatoPredefinito('CARTACEO', 'RIGIDA');
      this.aggiungiFormatoPredefinito('EBOOK', 'FLESSIBILE');
    }
  }

  get formati(): FormArray {
    return this.form.get('formati') as FormArray;
  }

  creaFormatiGroup(id?: number, tipoSupporto = 'CARTACEO', tipoCopertina = 'FLESSIBILE', prezzo = 1.0, quantita = 1, isbn = '', attivo = true, copertina = ''): FormGroup {
    return this.fb.group({
      id: [id],
      tipoSupporto: [tipoSupporto, Validators.required],
      tipoCopertina: [tipoCopertina],
      isbn: [isbn],
      prezzo: [prezzo, [Validators.required, Validators.min(0)]],
      quantita: [quantita, [Validators.min(0)]],
      attivo: [attivo],
      copertina: [copertina] 
    });
  }

  aggiungiFormatoPredefinito(tipoSupporto: string, tipoCopertina: string): void {
    const esiste = this.formati.value.some((f: any) => 
      f.tipoSupporto === tipoSupporto && f.tipoCopertina === tipoCopertina
    );
    
    if (!esiste) {
      this.formati.push(this.creaFormatiGroup(undefined, tipoSupporto, tipoCopertina));
    }
  }

rimuoviFormato(index: number): void {
    this.formati.removeAt(index);
    
    // Riassegna gli indici della mappa per mantenere allineati i file
    const nuovaMappa = new Map<number, File>();
    this.selectedFiles.forEach((file, key) => {
      if (key < index) nuovaMappa.set(key, file);
      if (key > index) nuovaMappa.set(key - 1, file); // Scala di uno
    });
    this.selectedFiles = nuovaMappa;
  }

  getFormatoGroup(index: number): FormGroup {
    return this.formati.at(index) as FormGroup;
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

        if (res.formati && res.formati.length > 0) {
          this.formatiEsistenti.set(res.formati);
          res.formati.forEach((f: any) => {
            this.formati.push(this.creaFormatiGroup(
              f.id,
              f.tipoSupporto || 'CARTACEO',
              f.tipoCopertina || 'FLESSIBILE',
              f.prezzo || 1.0,
              f.quantita || 0,
              f.isbn || '',
              f.attivo !== undefined ? f.attivo : true,
              f.copertina 
            ));
          });
        }
      }
    });
  }

  // NUOVO: Salva il file nella mappa usando l'indice del formato come chiave
  onFileSelected(event: any, index: number) {
    const file = event.target.files[0] as File;
    if (file) {
      this.selectedFiles.set(index, file);
    } else {
      this.selectedFiles.delete(index);
    }
  }

  // NUOVO: Helper per formattare l'URL della miniatura in tabella
  getImmagineUrl(copertina: string | null): string | null {
    if (!copertina) return null;
    if (copertina.startsWith('http')) return copertina;
    return 'http://localhost:8080/uploads/' + copertina;
  }

  onCategoriaChange(idCategoria: number) {
    const categorieAttuali = this.form.get('idCategorie')?.value as number[] || [];
    
    const nuoveCategorie = categorieAttuali.includes(idCategoria)
      ? categorieAttuali.filter(id => id !== idCategoria)
      : [...categorieAttuali, idCategoria];
      
    this.form.patchValue({ idCategorie: nuoveCategorie });
    this.form.get('idCategorie')?.markAsTouched();
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
      tipoSupporto: 'CARTACEO', 
      tipoCopertina: 'FLESSIBILE', 
      prezzo: 0, 
      quantita: 0, 
      isbn: '' 
    };

    if (this.editMode) {
      libroData.id = this.idLibro;
      this.libroService.update(libroData).subscribe({
        next: () => this.salvaFormati(),
        error: (err) => this.gestisciErrore(err)
      });
    } else {
      this.libroService.create(libroData).subscribe({
        next: (res: any) => {
          const nuovoIdLibro = res.id || res.id_libro || (res.obj ? res.obj.id || res.obj : null); 
          if (nuovoIdLibro) {
            this.idLibro = nuovoIdLibro;
            this.salvaFormati();
          } else {
            this.gestisciErrore({ error: { message: "Salvataggio riuscito, ma non trovo l'ID del libro per salvare i formati. Controlla la console." } });
          }
        },
        error: (err) => this.gestisciErrore(err)
      });
    }
  }

  private salvaFormati(): void {
    const formatiDaSalvare = this.formati.value as any[];
    let operazioniCompletate = 0;
    const totaleOperazioni = formatiDaSalvare.length;

    if (totaleOperazioni === 0) {
      this.finalizza();
      return;
    }

    formatiDaSalvare.forEach((formato, index) => {
      const formatoData: any = {
        id: formato.id,
        idLibro: this.idLibro!,
        tipoSupporto: formato.tipoSupporto,
        tipoCopertina: formato.tipoSupporto === 'EBOOK' ? null : (formato.tipoCopertina || 'FLESSIBILE'),
        isbn: formato.isbn && formato.isbn.trim() !== '' ? formato.isbn : null,
        prezzo: formato.prezzo || 0,
        quantita: formato.quantita || 0,
        attivo: formato.attivo,
        copertina: formato.copertina 
      };

      const operazione = formato.id 
        ? this.libroService.updateFormato(formatoData) 
        : this.libroService.createFormato(this.idLibro!, formatoData);

      operazione.subscribe({
        next: (res: any) => {
          
          // 🛠️ IL FIX È QUI: 
          // Se stiamo aggiornando usiamo l'ID che già conosciamo.
          // Se stiamo creando, lo andiamo a pescare dalla risposta del server.
          let targetFormatoId = formato.id;
          if (!targetFormatoId && res) {
            targetFormatoId = res.id || res.id_formato || (res.obj ? res.obj.id || res.obj : res);
          }
          
          const fileToUpload = this.selectedFiles.get(index);

          // Procedi con l'upload solo se c'è un file e abbiamo l'ID corretto
          if (fileToUpload && targetFormatoId) {
            console.log(`Avvio upload copertina per il formato ${index + 1} (ID: ${targetFormatoId})`);
            
            this.libroService.uploadCopertina(targetFormatoId, fileToUpload).subscribe({
              next: () => {
                console.log(`✅ Upload immagine completato per formato ${index + 1}!`);
                operazioniCompletate++;
                if (operazioniCompletate === totaleOperazioni) this.finalizza();
              },
              error: (err) => {
                console.error(`❌ Errore upload immagine per formato ${index + 1}:`, err);
                operazioniCompletate++;
                if (operazioniCompletate === totaleOperazioni) this.finalizza();
              }
            });
            
          } else {
            operazioniCompletate++;
            if (operazioniCompletate === totaleOperazioni) this.finalizza();
          }
        },
        error: (err) => {
          console.error(`Errore nel salvataggio del formato ${index + 1}:`, err);
          operazioniCompletate++;
          if (operazioniCompletate === totaleOperazioni) this.finalizza();
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
    console.group("🔴 DETTAGLIO ERRORE SERVER (HTTP " + err.status + ")");
    console.error("Oggetto Errore Completo:", err);
    console.error("Messaggio dal Backend:", err.error?.message || "Nessun messaggio");
    console.error("Dettagli validazione (se presenti):", err.error?.errors || err.error?.details);
    console.groupEnd();
    
    alert("Attenzione: " + (err.error?.message || "Errore imprevisto dal server."));
  }
}