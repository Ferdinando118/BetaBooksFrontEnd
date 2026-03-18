import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing-module';
import { Catalogo } from './pages/catalogo/catalogo';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HomeRoutingModule,
    Catalogo
  ]
})
export class HomeModule {}