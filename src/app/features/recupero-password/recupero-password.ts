import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // 1. Importa ReactiveFormsModule
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recupero-password',
  standalone: true, 
  imports: [ReactiveFormsModule],
  templateUrl: './recupero-password.html',
  styleUrl: './recupero-password.css',
})
export class RecuperoPassword {
  form: FormGroup;
  loading = false;
  errore: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() { return this.form.get('email')!; }

  
  submit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.loading = true;
  this.errore = null;

  const emailValue = this.form.value.email;

 
  this.auth.emailCambioPassword(emailValue).subscribe({
    next: (res) => {
      this.loading = false;
      alert("Se l'email è presente nei nostri sistemi, riceverai a breve un link di recupero.");
      this.router.navigate(['/login']);
    },
    error: (err) => {
      this.loading = false;
      this.errore = err.error?.message || "Si è verificato un errore durante l'invio della mail.";
    }
  });
}
}