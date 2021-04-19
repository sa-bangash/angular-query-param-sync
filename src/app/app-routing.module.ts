import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BooksComponent } from './books/books.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

const routes: Routes = [
  {
    redirectTo: 'login',
    path: '',
    pathMatch: 'full',
  },
  {
    component: LoginComponent,
    path: 'login',
  },
  {
    component: SignupComponent,
    path: 'signup',
  },
  {
    component: BooksComponent,
    path: 'books',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
