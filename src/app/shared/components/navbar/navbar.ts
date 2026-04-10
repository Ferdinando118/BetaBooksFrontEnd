// navbar.ts
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
// ❌ Rimuovi: import { email } from '@angular/forms/signals';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  menuAperto = false;
  loading = false;

  constructor(public auth: AuthService, private router: Router) {}

  logout(): void { this.auth.logout(); }
  toggleMenu(): void { this.menuAperto = !this.menuAperto; }

  mandaVerifica(): void {
    const email = this.auth.grant().utente?.email; // ✅ variabile locale
    if (typeof email === 'string') {
      this.loading = true;
      this.auth.verificaMail(email).subscribe({  // ✅ sottoscrivi l'Observable
        next: () => { /* loading rimane true = mostra "Mail inviata a..." */ },
        error: () => { this.loading = false; }
      });
    }
  }
}