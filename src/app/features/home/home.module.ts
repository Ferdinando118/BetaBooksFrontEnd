import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeRoutingModule } from './home.routing.module';
import { Catalogo } from './pages/catalogo/catalogo';
import { Dettaglio } from './pages/dettaglio/dettaglio';

@NgModule({
  declarations: [Dettaglio],
  imports: [CommonModule, Catalogo, FormsModule, ReactiveFormsModule, HomeRoutingModule],
})
export class HomeModule {}
