// navbar.ts
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';;

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
    const email = this.auth.grant().utente?.email; 
    if (typeof email === 'string') {
      this.loading = true;
      this.auth.verificaMail(email).subscribe({  
        next: () => {},
        error: () => { this.loading = false; }
      });
    }
  }
}