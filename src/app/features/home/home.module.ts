import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeRoutingModule } from './home.routing.module';
import { Catalogo } from './pages/catalogo/catalogo';
import { Dettaglio } from './pages/dettaglio/dettaglio';

@NgModule({
  declarations: [
    Catalogo,
    Dettaglio
  ],
  imports: [
    CommonModule,
    FormsModule,           // Serve per [(ngModel)] nella barra di ricerca
    ReactiveFormsModule,   // Serve per le recensioni nel Dettaglio
    HomeRoutingModule
  ]
})
export class HomeModule {}