import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CartRoutingModule } from './cart.routing.module';
import { Carrello } from './pages/carrello/carrello';
import { Checkout } from './pages/checkout/checkout';

@NgModule({
  declarations: [
    Carrello,
    Checkout
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CartRoutingModule
  ]
})
export class CartModule {}