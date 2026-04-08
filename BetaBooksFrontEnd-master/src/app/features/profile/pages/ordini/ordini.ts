import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrdineService } from '../../../../core/services/ordine';
import { Ordine, StatoTracking, TrackingSpedizione, TipoEdizione } from '../../../../core/models/models';

@Component({
  selector: 'app-ordini',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ordini.html',
  styleUrl: './ordini.css'
})
export class OrdiniComponent implements OnInit {
  readonly trackingSteps: StatoTracking[] = [
    StatoTracking.PREPARAZIONE,
    StatoTracking.RITIRO_CORRIERE,
    StatoTracking.IN_TRANSITO,
    StatoTracking.IN_CONSEGNA,
    StatoTracking.CONSEGNATO
  ];

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

  trackingPercent(tracking?: TrackingSpedizione): number {
    if (!tracking) return 0;
    const idx = this.trackingSteps.indexOf(tracking.stato);
    if (idx <= 0) return 10;
    return Math.round((idx / (this.trackingSteps.length - 1)) * 100);
  }

  trackingLabel(stato: StatoTracking): string {
    return ({
      [StatoTracking.PREPARAZIONE]: 'Preparazione',
      [StatoTracking.RITIRO_CORRIERE]: 'Ritiro corriere',
      [StatoTracking.IN_TRANSITO]: 'In transito',
      [StatoTracking.IN_CONSEGNA]: 'In consegna',
      [StatoTracking.CONSEGNATO]: 'Consegnato'
    })[stato];
  }
}