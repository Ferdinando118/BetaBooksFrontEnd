import { NgModule } from '@angular/core';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';

@NgModule({
  imports: [Navbar, Footer],
  exports: [Navbar, Footer]
})
export class SharedModule {}