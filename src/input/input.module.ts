import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiIconModule } from '../icon/icon.module';
import { UiInputResetDirective } from './input-reset.directive';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        UiIconModule
    ],
    declarations: [
        UiInputResetDirective
    ],
    exports: [
        UiInputResetDirective
    ]
})
export class UiInputModule {
}
