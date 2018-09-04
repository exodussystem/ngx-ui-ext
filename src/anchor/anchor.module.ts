/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 6/12/2017.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnchorDirective } from './anchor.directive';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        AnchorDirective
    ],
    exports: [
        AnchorDirective
    ]
})
export class UiAnchorModule {
}