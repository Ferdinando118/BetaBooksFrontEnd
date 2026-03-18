import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LibroService } from '../../../../core/services/libro';
import { Libro } from '../../../../core/models/models';
import { BookHoverDirective } from '../../../../shared/directives/book-hover.directive';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BookHoverDirective],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class Catalogo implements OnInit {
  libri: Libro[] = [];
  libriFiltrati: Libro[] = [];
  categorie: string[] = [];

  ricerca = '';
  categoriaSelezionata = '';
  ordinamento = 'titolo';
  loading = true;

  constructor(private libroService: LibroService) {}

  ngOnInit(): void {
    this.libroService.getAll().subscribe(libri => {
      this.libri = libri;
      this.categorie = [...new Set(libri.flatMap(l => l.categorie?.map(c => c.nome) ?? []))];
      this.filtra();
      this.loading = false;
    });
  }

  filtra(): void {
    let risultati = [...this.libri];

    if (this.ricerca.trim()) {
      const q = this.ricerca.toLowerCase();
      risultati = risultati.filter(l =>
        l.titolo.toLowerCase().includes(q) ||
        l.autore.nome.toLowerCase().includes(q) ||
        l.autore.cognome.toLowerCase().includes(q)
      );
    }

    if (this.categoriaSelezionata) {
      risultati = risultati.filter(l =>
        l.categorie?.some(c => c.nome === this.categoriaSelezionata)
      );
    }

    switch (this.ordinamento) {
      case 'prezzo-asc':  risultati.sort((a, b) => a.prezzo - b.prezzo); break;
      case 'prezzo-desc': risultati.sort((a, b) => b.prezzo - a.prezzo); break;
      case 'voto':        risultati.sort((a, b) => (b.valutazioneMedia ?? 0) - (a.valutazioneMedia ?? 0)); break;
      default:            risultati.sort((a, b) => a.titolo.localeCompare(b.titolo));
    }

    this.libriFiltrati = risultati;
  }

  reset(): void {
    this.ricerca = '';
    this.categoriaSelezionata = '';
    this.ordinamento = 'titolo';
    this.filtra();
  }

  stelle(n: number): string {
    return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
  }
}