import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { AppComponent } from './app'; 
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';
import { skipUploadsInterceptor} from './core/interceptors/skip.interceptor';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    Footer
  ],
  imports: [
    BrowserModule, 
    RouterModule.forRoot(routes),
    Navbar
  ],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor, skipUploadsInterceptor]))
  ],
  bootstrap: [AppComponent] 
})
export class AppModule {}