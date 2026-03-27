import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';

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
    this.errore = null;

    // Estraiamo SOLO email e password dal form, ignorando nome e cognome per ora
    const payload = {
      email: this.form.value.email,
      password: this.form.value.password
    };

    this.auth.register(payload).subscribe({
      next: () => {
        // Dopo la registrazione, mandiamolo alla pagina di login!
        this.router.navigate(['/auth/login']); 
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