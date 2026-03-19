import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing-module';
import { Catalogo } from './pages/catalogo/catalogo';
import { Dettaglio } from './pages/dettaglio/dettaglio';

@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    Catalogo,
    Dettaglio
  ]
})
export class HomeModule {}