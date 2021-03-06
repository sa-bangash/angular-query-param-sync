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
    loadChildren: () => import('./books/book.module').then((m) => m.BookModule),
    path: 'books',
  },
  {
    loadChildren: () =>
      import('./student/student.module').then((m) => m.StudentModule),
    path: 'student',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
