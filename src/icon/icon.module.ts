/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 7/2/2017.
 */

import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiIconDirective } from './icon.directive';
import { UiIconComponent } from './icon.component';
import { IconFontType } from './icon';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        UiIconComponent,
        UiIconDirective
    ],
    exports: [
        UiIconComponent,
        UiIconDirective
    ]
})
export class UiIconModule {
    public static forRoot(fontType?: IconFontType): ModuleWithProviders {
        return {
            ngModule: UiIconModule,
            providers: [{provide: "FONT_TYPE", useValue: fontType || 'fa'}]
        };
    }
}
