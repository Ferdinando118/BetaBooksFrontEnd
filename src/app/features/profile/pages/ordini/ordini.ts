import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrdineService } from '../../../../core/services/ordine';
import { Ordine } from '../../../../core/models/models';

@Component({
  selector: 'app-ordini',
  standalone: false,
  templateUrl: './ordini.html',
  styleUrl: './ordini.css'
})
export class OrdiniComponent implements OnInit {
  ordini: Ordine[] = [];
  ordineAperto: number | null = null;
  loading = true;

  constructor(private ordineService: OrdineService) {}

  ngOnInit(): void {
    this.ordineService.getOrdiniUtente().subscribe((ordini: Ordine[]) => {
      this.ordini = ordini;
      this.loading = false;
    });
  }

  toggleDettaglio(id: number): void {
    this.ordineAperto = this.ordineAperto === id ? null : id;
  }

  badgeClasse(stato: string): string {
    return ({
      'IN_ATTESA':  'badge badge-attesa',
      'SPEDITO':    'badge badge-spedito',
      'CONSEGNATO': 'badge badge-consegnato'
    } as Record<string, string>)[stato] ?? 'badge';
  }

  iconaStato(stato: string): string {
    return ({
      'IN_ATTESA':  '🕐',
      'SPEDITO':    '🚚',
      'CONSEGNATO': '✅'
    } as Record<string, string>)[stato] ?? '';
  }
}