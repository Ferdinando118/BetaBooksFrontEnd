import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-nuova-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './nuova-password.html',
  styleUrl: './nuova-password.css',
})
export class NuovaPassword implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  resetForm = new FormGroup(
    {
      nuovaPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
      confermaPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: (group) => this.passwordMatchValidator(group as FormGroup) },
  );

  token: string = '';
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.errorMessage = 'Token non valido o mancante. Richiedi un nuovo link di recupero.';
    }
  }

  private passwordMatchValidator(g: FormGroup) {
    const pwd = g.get('nuovaPassword')?.value;
    const cpwd = g.get('confermaPassword')?.value;
    return pwd === cpwd ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.resetForm.valid && this.token) {
      this.loading = true;
      this.errorMessage = '';

      const payload = {
        token: this.token,
        nuovaPassword: this.resetForm.getRawValue().nuovaPassword,
      };

      this.authService.confirmPasswordRecovery(payload).subscribe({
        next: () => {
          this.router.navigate(['auth/login']);
        },
        error: (err) => {
          this.loading = false;

          this.errorMessage =
            err.error?.message ||
            'Errore durante il reset della password. Il link potrebbe essere scaduto.';
        },
      });
    } else {
      this.resetForm.markAllAsTouched();
    }
  }
}
