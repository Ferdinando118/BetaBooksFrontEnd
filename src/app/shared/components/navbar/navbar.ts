import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule} from '@angular/common';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  menuAperto = false;
  dropdownAperto = false; // NUOVO: Stato del menu utente

  constructor(public auth: AuthService, private router: Router) {}

  logout(): void {
    this.dropdownAperto = false; // Chiudi il menu quando esce
    this.auth.logout();
  }

  toggleMenu(): void {
    this.menuAperto = !this.menuAperto;
  }

  // NUOVO: Apri/Chiudi dropdown utente
  toggleDropdown(): void {
    this.dropdownAperto = !this.dropdownAperto;
  }

  // NUOVO: Prende la prima lettera dell'email
  getIniziale(): string {
    const email = this.auth.grant().utente?.email;
    return email ? email.charAt(0).toUpperCase() : 'U';
  }
}