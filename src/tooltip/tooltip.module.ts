/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 4/27/2017.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiTooltipDirective } from './tooltip.directive';
import { UiTooltipPopupComponent } from './tooltip-popup.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        UiTooltipDirective,
        UiTooltipPopupComponent
    ],
    exports: [
        UiTooltipDirective,
        UiTooltipPopupComponent
    ],
    entryComponents: [
        UiTooltipPopupComponent
    ]
})
export class UiTooltipModule {
}