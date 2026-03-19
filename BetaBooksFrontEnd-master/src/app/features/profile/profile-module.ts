import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileRoutingModule } from './profile-routing-module';
import { Profilo } from './pages/profilo/profilo';
import { OrdiniComponent } from './pages/ordini/ordini';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProfileRoutingModule,
    Profilo,
    OrdiniComponent
  ]
})
export class ProfileModule {}