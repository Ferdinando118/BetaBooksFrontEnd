import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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

    this.auth.register(this.form.value).subscribe({
      next: () => this.router.navigate(['/']),
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