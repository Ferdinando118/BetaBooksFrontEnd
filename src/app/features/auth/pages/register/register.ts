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
      // 2. L'utente è stato creato. Ora creiamo il suo Profilo Anagrafico!
      // Assicurati che Java restituisca l'ID dell'utente appena creato
      const idDelNuovoUtente = nuovoUtente.id || nuovoUtente.obj; 

      if (idDelNuovoUtente) {
        const payloadProfilo = {
          idUtente: idDelNuovoUtente,
          nome: this.form.value.nome,
          cognome: this.form.value.cognome
        };
        
        // Chiamata al ProfiloService (dovrai iniettarlo nel costruttore di Register)
        this.profiloService.saveProfilo(payloadProfilo).subscribe({
          next: () => this.router.navigate(['/auth/login']),
          error: () => { /* Gestisci eventuale errore profilo */ }
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
}

  get nome()     { return this.form.get('nome')!; }
  get cognome()  { return this.form.get('cognome')!; }
  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }
}