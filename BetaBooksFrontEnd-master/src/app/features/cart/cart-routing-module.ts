import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Carrello } from './pages/carrello/carrello';
import { Checkout } from './pages/checkout/checkout';

const routes: Routes = [
  { path: '',         component: Carrello },
  { path: 'checkout', component: Checkout },
  { path: '**',       redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CartRoutingModule {}