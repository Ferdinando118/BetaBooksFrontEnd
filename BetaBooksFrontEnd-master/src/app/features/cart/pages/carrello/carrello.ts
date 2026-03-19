import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarrelloService } from '../../../../core/services/carrello';
import { CarrelloItem } from '../../../../core/models/models';

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

  constructor(public carrelloService: CarrelloService) {}

  ngOnInit(): void {
    this.carrelloService.items$.subscribe((items: CarrelloItem[]) => {
      this.items = items;
      this.totale = this.carrelloService.getTotale();
    });
  }

  aumenta(libroId: number, quantita: number): void {
    this.carrelloService.aggiornaQuantita(libroId, quantita + 1);
  }

  diminuisci(libroId: number, quantita: number): void {
    this.carrelloService.aggiornaQuantita(libroId, quantita - 1);
  }

  rimuovi(libroId: number): void {
    this.carrelloService.rimuovi(libroId);
  }
}