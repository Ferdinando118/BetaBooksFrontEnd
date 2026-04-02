import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Profilo } from './pages/profilo/profilo';
import { Ordini } from './pages/ordini/ordini';

const routes: Routes = [
  { path: '',         component: Profilo },
  { path: 'ordini',   component: Ordini},
  { path: '**',       redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule {}