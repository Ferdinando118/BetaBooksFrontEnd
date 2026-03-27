import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth.routing.module';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

@NgModule({
  declarations: [
    Login,     
    Register     
  ],
  imports: [
    CommonModule,         
    ReactiveFormsModule,  
    AuthRoutingModule     
  ]
})
export class AuthModule {}