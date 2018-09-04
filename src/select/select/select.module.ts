/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 7/25/2017.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiSelectComponent } from './select.component';
import { UiSelectPopupComponent } from './select-popup.component';
import { UiSelectState } from './select.state';
import { PositionService } from '../position/position.service';
import { UiIconModule } from '../../icon/icon.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        UiIconModule
    ],
    declarations: [
        UiSelectComponent,
        UiSelectPopupComponent
    ],
    exports: [
        UiSelectComponent,
        UiSelectPopupComponent
    ],
    entryComponents: [
        UiSelectPopupComponent
    ],
    providers: [
        UiSelectState,
        PositionService
    ]
})
export class UiSelectModule {
}
