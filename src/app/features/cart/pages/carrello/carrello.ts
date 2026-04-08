import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarrelloService } from '../../../../core/services/carrello';
import { CarrelloItem, TipoEdizione } from '../../../../core/models/models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-carrello',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carrello.html',
  styleUrl: './carrello.css'
})
export class Carrello implements OnInit {
  items: CarrelloItem[] = [];
  totale = 0;
  private readonly destroy$ = new Subject<void>();

  readonly TipoEdizione = TipoEdizione;

  edizioni: Array<{ value: TipoEdizione; label: string }> = [
    { value: TipoEdizione.COPERTINA_FLESSIBILE, label: 'Copertina flessibile' },
    { value: TipoEdizione.COPERTINA_RIGIDA, label: 'Copertina rigida' },
    { value: TipoEdizione.EBOOK, label: 'E-book' }
  ];

  constructor(public carrelloService: CarrelloService) {}

  ngOnInit(): void {
    this.carrelloService.items$.pipe(takeUntil(this.destroy$)).subscribe((items: CarrelloItem[]) => {
      this.items = items;
      this.totale = this.carrelloService.getTotale();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  aumenta(itemId: number, quantita: number): void {
    this.carrelloService.aggiornaQuantita(itemId, quantita + 1);
  }

  diminuisci(itemId: number, quantita: number): void {
    this.carrelloService.aggiornaQuantita(itemId, quantita - 1);
  }

  rimuovi(itemId: number): void {
    this.carrelloService.rimuovi(itemId);
  }

  cambiaEdizione(itemId: number, nuovaEdizione: TipoEdizione): void {
    this.carrelloService.cambiaEdizione(itemId, nuovaEdizione);
  }

  onEdizioneChange(itemId: number, rawValue: string): void {
    this.cambiaEdizione(itemId, rawValue as TipoEdizione);
  }

  edizioneLabel(edizione: TipoEdizione): string {
    switch (edizione) {
      case TipoEdizione.COPERTINA_RIGIDA:
        return 'Copertina rigida';
      case TipoEdizione.EBOOK:
        return 'E-book';
      case TipoEdizione.COPERTINA_FLESSIBILE:
      default:
        return 'Copertina flessibile';
    }
  }
}