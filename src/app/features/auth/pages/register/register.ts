import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { ProfiloService } from '../../../../core/services/profilo';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  form: FormGroup;
  loading = false;
  errore: string | null = null;

  constructor(
    private profiloService: ProfiloService,
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nome:     ['', Validators.required],
      cognome:  ['', Validators.required],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
/*
  submit(): void {
  if (this.form.invalid) { this.form.markAllAsTouched(); return; }
  this.loading = true;

  const payloadUtente = {
    email: this.form.value.email,
    password: this.form.value.password
  };

  // 1. Registriamo l'utente (Email e Password)
  
  this.auth.register(payloadUtente).subscribe({
    next: (nuovoUtente: any) => {

      const idDelNuovoUtente = nuovoUtente.id || nuovoUtente.obj; 

      if (idDelNuovoUtente) {
        const payloadProfilo = {
          idUtente: idDelNuovoUtente,
          nome: this.form.value.nome,
          cognome: this.form.value.cognome
        };
        
      
        this.profiloService.saveProfilo(payloadProfilo).subscribe({
          next: () => this.router.navigate(['/auth/login']),
          error: () => {  }
        });
      } else {
        this.router.navigate(['/auth/login']);
      }
    },
    error: () => {
      this.errore = 'Registrazione fallita. Email già in uso?';
      this.loading = false;
    }
  });
}*/

submit(): void {
  if (this.form.invalid) { this.form.markAllAsTouched(); return; }
  this.loading = true;

  // Inviamo un unico payload con TUTTO quello che serve (email, pwd, nome, cognome)
  const payloadCompleto = {
    email: this.form.value.email,
    password: this.form.value.password,
    nome: this.form.value.nome,
    cognome: this.form.value.cognome
  };

  // Chiamiamo una sola volta il backend
  this.auth.register(payloadCompleto).subscribe({
    next: () => {
      // SUCCESS: il backend ha creato sia l'utente che il profilo in un colpo solo
      this.router.navigate(['/auth/login']);
    },
    error: (err) => {
      // ERROR: il backend gestirà l'errore (es. email già esistente)
      this.errore = 'Registrazione fallita. Riprova.';
      this.loading = false;
    }
  });
}

  get nome()     { return this.form.get('nome')!; }
  get cognome()  { return this.form.get('cognome')!; }
  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }
}