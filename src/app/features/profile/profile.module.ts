import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileRoutingModule } from './profile.routing.module';
import { Profilo } from './pages/profilo/profilo';
import { OrdiniComponent } from './pages/ordini/ordini';

@NgModule({
  declarations: [
    Profilo,
    OrdiniComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule, // Necessario per il form del Profilo
    ProfileRoutingModule
  ]
})
export class ProfileModule {}