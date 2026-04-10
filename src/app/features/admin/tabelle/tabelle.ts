import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoreService } from '../../../core/services/autore';
import { EditoreService } from '../../../core/services/editore';
import { CategoriaService } from '../../../core/services/categoria';

@Component({
  selector: 'app-tabelle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tabelle.html',
  styleUrls: ['./tabelle.css']
})
export class Tabelle {
  private autoreService = inject(AutoreService);
  private editoreService = inject(EditoreService);
  private categoriaService = inject(CategoriaService);
  private cdr = inject(ChangeDetectorRef);

  tabAttiva: 'autori' | 'editori' | 'categorie' | null = null;
  searchTerm: string = '';
  
  dati: any[] = [];
  datiFiltrati: any[] = [];

  showModal = false;
isModifica = false;
// Oggetto unico per il form
formData: any = {};

apriModaleNuovo() {
  this.isModifica = false;
  this.formData = {}; // Reset campi
  this.showModal = true;
}

ngOnInit() {
    // Impostiamo gli autori come tab predefinita all'apertura
    this.selezionaTab('autori');
  }

modifica(item: any) {
  this.isModifica = true;
  this.formData = { ...item }; // Copia l'oggetto per non modificare la riga in tabella subito
  this.showModal = true;
}

salva() {
  let service: any;
  const payload = { ...this.formData };

  // 1. Seleziona il servizio in base alla tab attiva
  if (this.tabAttiva === 'autori') service = this.autoreService;
  else if (this.tabAttiva === 'editori') service = this.editoreService;
  else if (this.tabAttiva === 'categorie') service = this.categoriaService;

  if (service) {
    // 2. Chiama update se isModifica è true, altrimenti create
    const richiesta = this.isModifica 
      ? service.update(payload) 
      : service.create(payload);

    richiesta.subscribe({
      next: (res: any) => {
        alert("Operazione completata con successo!");
        this.closeModal();
        this.caricaDati();
      },
      error: (err: any) => {
        console.error("Errore:", err);
        alert("Errore nel salvataggio: " + (err.error?.message || "Controlla i dati inviati"));
      }
    });
  }
}


closeModal() {
  this.showModal = false;
  this.formData = {};
}

  selezionaTab(tab: 'autori' | 'editori' | 'categorie') {
    this.tabAttiva = tab;
    this.searchTerm = '';
    this.showModal = false;
    this.caricaDati();
  }

  caricaDati() {
    let obs: any;

    if (this.tabAttiva === 'autori') obs = this.autoreService.getAll();
    else if (this.tabAttiva === 'editori') obs = this.editoreService.getAll();
    else if (this.tabAttiva === 'categorie') obs = this.categoriaService.getAll();

    if (obs) {
      obs.subscribe({
        next: (res: any) => {
          // Gestiamo sia se arriva Array diretto, sia se arriva oggetto Resp con .obj
          const lista = Array.isArray(res) ? res : (res.obj || []);
          this.dati = lista;
          this.applicaFiltro();
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error("Errore nel caricamento:", err)
      });
    }
  }

  applicaFiltro() {
    if (!this.searchTerm) {
      this.datiFiltrati = [...this.dati];
    } else {
      const s = this.searchTerm.toLowerCase();
      this.datiFiltrati = this.dati.filter(item => {
        // Cerchiamo in ID, Nome o Denominazione (a seconda dell'oggetto)
        const idStr = item.id?.toString() || '';
        const nome = (item.nome || item.denominazione || item.nomeCategoria || '').toLowerCase();
        return idStr.includes(s) || nome.includes(s);
      });
    }
  }


}