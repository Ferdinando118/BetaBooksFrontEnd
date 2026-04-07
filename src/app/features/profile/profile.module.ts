import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileRoutingModule } from './profile.routing.module';
import { Profilo } from './pages/profilo/profilo';
import { Ordini } from './pages/ordini/ordini';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    Profilo,
    Ordini
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule, // Necessario per il form del Profilo
    ProfileRoutingModule,
    FormsModule
  ]
})
export class ProfileModule {}