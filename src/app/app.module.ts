import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// Importa i tuoi file principali
import { AppComponent } from './app'; 
import { routes } from './app.routes';
import { jwtInterceptor } from './jwt-interceptor';

// Importa Navbar e Footer
import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';

@NgModule({
  declarations: [
    AppComponent,
    Navbar,  
    Footer
  ],
  imports: [
    BrowserModule, 
    RouterModule.forRoot(routes) 
  ],
  providers: [
    // Qui lasciamo solo l'interceptor per il token!
    provideHttpClient(withInterceptors([jwtInterceptor]))
  ],
  bootstrap: [AppComponent] 
})
export class AppModule {}