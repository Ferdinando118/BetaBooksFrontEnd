import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { OrdineService } from '../../../../core/services/ordine';
import { Utente, Ordine } from '../../../../core/models/models';

@Component({
  selector: 'app-profilo',
  standalone: false,
  templateUrl: './profilo.html',
  styleUrl: './profilo.css'
})
export class Profilo implements OnInit {
  utente: Utente | null = null;
  form: FormGroup;
  salvato = false;
  totaleOrdini = 0;

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private ordineService: OrdineService
  ) {
    this.form = this.fb.group({
      nome:     ['Mario',  Validators.required],
      cognome:  ['Rossi',  Validators.required],
      telefono: ['']
    });
  }

  ngOnInit(): void {
    this.utente = this.auth.grant().utente;
    this.ordineService.getOrdiniUtente().subscribe((ordini: Ordine[]) => {
      this.totaleOrdini = ordini.length;
    });
  }

  salva(): void {
    if (this.form.invalid) return;
    this.salvato = true;
    setTimeout(() => this.salvato = false, 3000);
  }

  logout(): void {
    this.auth.logout();
  }

  get nome()    { return this.form.get('nome')!; }
  get cognome() { return this.form.get('cognome')!; }
}