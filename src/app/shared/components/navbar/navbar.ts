import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  menuAperto = false;
  dropdownAperto = false;
  loading = false;

  auth = inject(AuthService);
  private router = inject(Router);

  constructor() {}

  logout(): void {
    this.dropdownAperto = false;
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  toggleMenu(): void {
    this.menuAperto = !this.menuAperto;
  }

  toggleDropdown(): void {
    this.dropdownAperto = !this.dropdownAperto;
  }

  /**
   * Gestisce l'invio della mail di convalida
   */
  mandaVerifica(): void {
    const email = this.auth.grant().utente?.email;
    if (typeof email === 'string') {
      this.loading = true;
      this.auth.verificaMail(email).subscribe({
        next: () => { 
          // loading rimane true per mostrare il feedback "Mail inviata" nel template
        },
        error: (err) => { 
          console.error("Errore invio verifica:", err);
          this.loading = false; 
        }
      });
    }
  }

  /**
   * Ritorna l'iniziale dell'email per l'avatar
   */
  getIniziale(): string {
    const email = this.auth.grant().utente?.email;
    return email ? email.charAt(0).toUpperCase() : 'U';
  }
}