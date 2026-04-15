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
  styleUrl: './register.css',
})
export class Register {
  form: FormGroup;
  loading = false;
  errore: string | null = null;

  constructor(
    private profiloService: ProfiloService,
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      passwordConferma: ['', [Validators.required]],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;

    if (this.form.value.password != this.form.value.passwordConferma) {
      this.errore = 'password non coincidono';
      this.loading = false;
      this.form.markAllAsTouched();
      return;
    }

    if (this.validaPassword(this.form.value.password).errors.length !== 0) {
      this.errore = '';
      for (const e of this.validaPassword(this.form.value.password).errors) {
        this.errore = this.errore + e + '\n';
      }
      this.loading = false;
      this.form.markAllAsTouched();
      return;
    }

    const payloadCompleto = {
      email: this.form.value.email,
      password: this.form.value.password,
      nome: this.form.value.nome,
      cognome: this.form.value.cognome,
    };

    this.auth.register(payloadCompleto).subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.errore = 'Registrazione fallita. Riprova.';
        this.loading = false;
      },
    });
  }

  validaPassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!/[A-Z]/.test(password)) errors.push('Almeno una lettera maiuscola');
    if (!/[a-z]/.test(password)) errors.push('Almeno una lettera minuscola');
    if (!/[0-9]/.test(password)) errors.push('Almeno un numero');
    if (!/[#?!@$%^&*-]/.test(password)) errors.push('Almeno un carattere speciale (#?!@$%^&*-)');
    if (password.length < 8) errors.push('Almeno 8 caratteri');

    return { valid: errors.length === 0, errors };
  }

  get nome() {
    return this.form.get('nome')!;
  }
  get cognome() {
    return this.form.get('cognome')!;
  }
  get email() {
    return this.form.get('email')!;
  }
  get password() {
    return this.form.get('password')!;
  }
}
