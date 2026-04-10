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
  styleUrl: './nuova-password.css'
})
export class NuovaPassword implements OnInit {
  // Dependency Injection moderna
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Definizione del Form fortemente tipizzato (Seconda opzione)
  // nonNullable: true assicura che il valore sia sempre stringa, mai null
  resetForm = new FormGroup({
    nuovaPassword: new FormControl('', { 
      nonNullable: true, 
      validators: [Validators.required, Validators.minLength(6)] 
    }),
    confermaPassword: new FormControl('', { 
      nonNullable: true, 
      validators: [Validators.required] 
    })
  }, { validators: (group) => this.passwordMatchValidator(group as FormGroup) });

  token: string = '';
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    // Recupero del token dall'URL
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    
    if (!this.token) {
      this.errorMessage = "Token non valido o mancante. Richiedi un nuovo link di recupero.";
    }
  }

  // Validatore per il confronto password
  private passwordMatchValidator(g: FormGroup) {
    const pwd = g.get('nuovaPassword')?.value;
    const cpwd = g.get('confermaPassword')?.value;
    return pwd === cpwd ? null : { mismatch: true };
  }

  onSubmit(): void {
    // Controllo validità e presenza token
    if (this.resetForm.valid && this.token) {
      this.loading = true;
      this.errorMessage = '';
      
      const payload = {
        token: this.token,
        nuovaPassword: this.resetForm.getRawValue().nuovaPassword
      };

      this.authService.confirmPasswordRecovery(payload).subscribe({
        next: () => {
          alert("Password aggiornata con successo! Ora puoi effettuare il login.");
          this.router.navigate(['/login']); 
        },
        error: (err) => {
          this.loading = false;
          // Gestione errore dal backend
          this.errorMessage = err.error?.message || "Errore durante il reset della password. Il link potrebbe essere scaduto.";
        }
      });
    } else {
      this.resetForm.markAllAsTouched();
    }
  }
}