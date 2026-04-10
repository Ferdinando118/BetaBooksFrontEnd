import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tabelle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tabelle.html',
  styleUrl: './tabelle.css'
})
export class Tabelle implements OnInit {
  currentDate = new Date();
  totalLibri = 284;
  ordiniPendenti = 12;
  totalUtenti = 1456;
  ricaviMensili = 8543.50;

  constructor() {}

  ngOnInit() {
    // Carica statistiche da servizi
    this.caricaStatistiche();
  }

  caricaStatistiche() {
    // Qui potrai integrare i servizi per caricamento dati reali
    // this.libroService.contaLibri().subscribe(count => this.totalLibri = count);
    // this.ordineService.contaOrdiniPendenti().subscribe(count => this.ordiniPendenti = count);
  }
}
