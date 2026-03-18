import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, AsyncPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, AsyncPipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  menuAperto = false;

  constructor(public auth: AuthService, private router: Router) {}

  logout(): void {
    this.auth.logout();
  }

  toggleMenu(): void {
    this.menuAperto = !this.menuAperto;
  }
}