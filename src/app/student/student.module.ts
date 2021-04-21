import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentComponent } from './student/student.component';
import { RouterModule, Routes } from '@angular/router';
import { ShareModule } from '../share/share.module';

const routes: Routes = [
  {
    redirectTo: 'student',
    path: '',
    pathMatch: 'full',
  },
  {
    component: StudentComponent,
    path: 'student',
  },
];

@NgModule({
  declarations: [StudentComponent],
  imports: [CommonModule, ShareModule, RouterModule.forChild(routes)],
})
export class StudentModule {}
