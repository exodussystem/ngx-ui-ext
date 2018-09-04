/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 5/24/2017.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiStickyService } from './sticky.service';
import { UiStickyBodyDirective } from './sticky-body.directive';
import { UiStickyElementDirective } from './sticky-element.directive';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        UiStickyBodyDirective,
        UiStickyElementDirective
    ],
    exports: [
        UiStickyBodyDirective,
        UiStickyElementDirective
    ],
    providers: [
        UiStickyService
    ]
})
export class UiStickyModule {
}