import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { AutoreService } from '../../core/services/autore';
import { LibroService } from '../../core/services/libro';
import { Autore, Libro } from '../../core/models/models';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dettagli-autore',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dettagli-autore.html',
  styleUrl: './dettagli-autore.css',
})
export class DettagliAutore implements OnInit {
  private autoreService = inject(AutoreService);
  private libroService = inject(LibroService);
  private route = inject(ActivatedRoute);

  autore = signal<Autore | null>(null);
  private tuttiILibri = signal<Libro[]>([]);

  libriDellAutore = computed(() => {
    const aut = this.autore();
    const libri = this.tuttiILibri();

    if (!aut || !libri.length) return [];

    const visti = new Set<number>();
    return libri.filter((l) => {
      if (l.autore.id !== aut.id || visti.has(l.id)) return false;
      visti.add(l.id);
      return true;
    });
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.autoreService.getById(id).subscribe((data) => this.autore.set(data));
    this.libroService.getAll().subscribe((libri) => {
      this.tuttiILibri.set(libri);
    });
  }

  getImmagine(libro: any): string {
    const copertina = libro.formati?.[0]?.copertina;
    if (!copertina) return '/assets/images/default-book.png';
    if (copertina.startsWith('http')) return copertina;
    return 'http://localhost:8080/uploads/' + copertina;
  }

  stelle(n: number): string {
    return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
  }
}
