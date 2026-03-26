import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, AsyncPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { CarrelloService } from '../../../core/services/carrello';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, AsyncPipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  menuAperto = false;
  contatore = 0;

  constructor(public auth: AuthService, private router: Router, private carrelloService: CarrelloService) {}

  logout(): void {
    this.auth.logout();
  }

  ngOnInit(): void {
    this.carrelloService.items$.subscribe(() => {
      this.contatore = this.carrelloService.getContatore();
    });
  }

  toggleMenu(): void {
    this.menuAperto = !this.menuAperto;
  }
}