import { Component, OnInit, ChangeDetectorRef, inject} from '@angular/core';
import { AuditService } from '../../../core/services/audit';
import { AuditLogDTO } from '../../../core/models/models';
import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-audit',
  imports: [CommonModule, FormsModule],
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

ngOnInit(): void {
    this.caricaLog();
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
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error("Errore Audit:", err)
    });
  }

  
  getKeysAndValues(obj: any): { key: string, value: any }[] {
    if (!obj) return [];
    return Object.keys(obj).map(key => ({
      key: key,
      value: obj[key]
    }));
  }


applicaFiltro() {
  const s = this.searchTerm.toLowerCase();
  const op = this.selectedOperazione;

  this.logsFiltrati = this.logs.filter(log => {
    
    const matchTesto = 
      log.nomeTabella.toLowerCase().includes(s) ||
      JSON.stringify(log.valoriNuovi).toLowerCase().includes(s);

   
    const matchOp = op === '' || log.tipoOperazione === op;

    return matchTesto && matchOp; 
  });
}
}
