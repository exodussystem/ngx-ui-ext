/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 7/25/2017.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiTypeaheadDirective } from './typeahead.directive';
import { UiTypeaheadPopupComponent } from './typeahead-popup.component';
import { PositionService } from '../../common/service';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        UiTypeaheadDirective,
        UiTypeaheadPopupComponent
    ],
    exports: [
        UiTypeaheadDirective,
        UiTypeaheadPopupComponent
    ],
    entryComponents: [
        UiTypeaheadPopupComponent
    ],
    providers: [
        PositionService
    ]
})
export class UiTypeaheadModule {
}
