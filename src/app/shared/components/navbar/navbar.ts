import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
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
  }

  toggleMenu(): void {
    this.menuAperto = !this.menuAperto;
  }

  toggleDropdown(): void {
    this.dropdownAperto = !this.dropdownAperto;
  }

  getIniziale(): string {
    const email = this.auth.grant().utente?.email;
    return email ? email.charAt(0).toUpperCase() : 'U';
  }

  mandaVerifica(): void {
    const email = this.auth.grant().utente?.email;
    if (typeof email === 'string') {
      this.loading = true;
      this.auth.verificaMail(email).subscribe({
        next: () => {},
        error: () => {
          this.loading = false;
        },
      });
    }
  }
}
