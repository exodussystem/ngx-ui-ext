/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 4/27/2017.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiCollapsiblePanelComponent } from './collapsible-panel.component';
import { UiStickyModule } from '../sticky/sticky.module';

@NgModule({
    imports: [
        CommonModule,
        UiStickyModule,
    ],
    declarations: [
        UiCollapsiblePanelComponent
    ],
    exports: [
        UiCollapsiblePanelComponent
    ]
})
export class UiPanelModule {
}