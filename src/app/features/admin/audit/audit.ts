import { Component, OnInit, ChangeDetectorRef, inject} from '@angular/core';
import { AuditService } from '../../../core/services/audit';
import { AuditLogDTO } from '../../../core/models/models';
import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-audit',
  imports: [CommonModule, DatePipe, JsonPipe, FormsModule],
  templateUrl: './audit.html',
  styleUrl: './audit.css',
})
export class Audit implements OnInit {
  logs: AuditLogDTO[] = [];
  private cdr = inject(ChangeDetectorRef);
  searchTerm: string = '';
  logsFiltrati: AuditLogDTO[] = [];
  selectedOperazione: string = '';

  constructor(private auditService: AuditService) {
  }

  /*Per la gestione del caso di Race Condition
  Quando l'applicazione parte, il componente Audit (o Spedizioni) viene inizializzato immediatamente dall'albero dei componenti. Tuttavia, in quel preciso istante, il sistema di autenticazione (auth.ts) sta ancora lavorando in background per verificare il token, recuperare la sessione dal server e impostare gli header di autorizzazione nelle chiamate HTTP.
  Di conseguenza, la chiamata findAll() partiva prima che l'app fosse autenticata.
  Abbiamo implementato una strategia a due livelli per forzare Angular a "vedere" i dati:
  ChangeDetectorRef (detectChanges): Abbiamo forzato manualmente Angular a aggiornare la vista dopo aver ricevuto i dati.
  setTimeout (Il "Paracadute"): Abbiamo inserito un piccolo ritardo (500ms). Questo dà al sistema di autenticazione il tempo necessario per completare le operazioni di login e validazione della sessione. Se dopo mezzo secondo i dati risultano ancora vuoti, il "paracadute" innesca una seconda chiamata (caricaLog), che a quel punto trova il sistema autenticato e recupera correttamente i dati dal server.
  */

ngOnInit(): void {
    this.caricaLog();
    
    // "Paracadute" di sicurezza come in spedizioni
    setTimeout(() => {
      if (this.logs.length === 0) {
        console.log("Forzo caricamento di sicurezza audit...");
        this.caricaLog();
      }
    }, 500);
  }

caricaLog(): void {
    this.auditService.findAll().subscribe({
      next: (data) => {
        this.logs = data;
        this.applicaFiltro();
        this.cdr.detectChanges(); // <--- Fondamentale per forzare il rendering
      },
      error: (err) => console.error("Errore Audit:", err)
    });
  }

    //metodo che prende l'oggetto JSON e lo trasforma in un array di oggetti {key, value}. Questo permetterà all'admin di scorrere i dati nel template HTML molto facilmente.
  getKeysAndValues(obj: any): { key: string, value: any }[] {
    if (!obj) return [];
    return Object.keys(obj).map(key => ({
      key: key,
      value: obj[key]
    }));
  }
/*
  applicaFiltro() {
  if (!this.searchTerm.trim()) {
    this.logsFiltrati = [...this.logs];
  } else {
    const s = this.searchTerm.toLowerCase();
    this.logsFiltrati = this.logs.filter(log => 
      log.nomeTabella.toLowerCase().includes(s) ||
      log.tipoOperazione.toLowerCase().includes(s) ||
      JSON.stringify(log.valoriNuovi).toLowerCase().includes(s)
    );
  }
}*/

applicaFiltro() {
  const s = this.searchTerm.toLowerCase();
  const op = this.selectedOperazione;

  this.logsFiltrati = this.logs.filter(log => {
    // 1. Filtro testo libero
    const matchTesto = 
      log.nomeTabella.toLowerCase().includes(s) ||
      JSON.stringify(log.valoriNuovi).toLowerCase().includes(s);

    // 2. Filtro operazione (se selezionato)
    const matchOp = op === '' || log.tipoOperazione === op;

    return matchTesto && matchOp; // Devono essere veri entrambi
  });
}
}
