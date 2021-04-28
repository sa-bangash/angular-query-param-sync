import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  exports: [FormsModule, ReactiveFormsModule],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class ShareModule {}
