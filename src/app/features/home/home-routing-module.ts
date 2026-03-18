import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Catalogo } from './pages/catalogo/catalogo';

const routes: Routes = [
  { path: '', component: Catalogo }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}