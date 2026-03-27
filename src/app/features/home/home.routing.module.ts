import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Catalogo } from './pages/catalogo/catalogo';
import { Dettaglio } from './pages/dettaglio/dettaglio';

const routes: Routes = [
  { path: '',            component: Catalogo },
  { path: 'libro/:id',   component: Dettaglio }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}