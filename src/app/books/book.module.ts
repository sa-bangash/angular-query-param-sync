import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BooksComponent } from './books.component';
import { ShareModule } from '../share/share.module';

const routes: Routes = [
  {
    redirectTo: 'books',
    path: '',
    pathMatch: 'full',
  },
  {
    component: BooksComponent,
    path: 'books',
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, ShareModule, RouterModule.forChild(routes)],
})
export class BookModule {}
