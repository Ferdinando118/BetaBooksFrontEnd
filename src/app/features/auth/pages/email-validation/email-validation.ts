import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-email-validation',
  imports: [],
  templateUrl: './email-validation.html',
  styleUrl: './email-validation.css',
})
export class EmailValidation {
  stato: 'caricamento' | 'successo' | 'errore' = 'caricamento';

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const email = this.route.snapshot.paramMap.get('email');
    if (typeof email === 'string') {
      this.auth.attivaValidazione(email).subscribe({
        next: () => {
          this.stato = 'successo';
          setTimeout(() => this.router.navigate(['/auth/login']), 3000);
        },
        error: () => (this.stato = 'errore'),
      });
    } else {
      this.stato = 'errore';
    }
  }
}
