/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 5/30/2017.
 */

import { NgModule, Type, ANALYZE_FOR_ENTRY_COMPONENTS, ModuleWithProviders } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UiIconModule } from '../icon';
import { UiModalComponent } from './modal.component';
import { UiModalService } from './modal.service';
import { UiDialogService } from './dialog/dialog.service';
import { UiConfirmDialogComponent } from './dialog/confirm-dialog';
import { UiProgressDialogComponent } from './dialog/progress-dialog';

@NgModule({
    imports: [
        BrowserModule,
        UiIconModule
    ],
    declarations: [
        UiModalComponent,
        UiConfirmDialogComponent,
        UiProgressDialogComponent
    ],
    providers: [
        UiModalService,
        UiDialogService
    ],
    entryComponents: [
        UiModalComponent,
        UiConfirmDialogComponent,
        UiProgressDialogComponent
    ]
})
export class UiModalModule {
    static withComponents(components: Array<Type<any>>): ModuleWithProviders {
        return {
            ngModule: UiModalModule,
            providers: [{provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true}]
        };
    }
}