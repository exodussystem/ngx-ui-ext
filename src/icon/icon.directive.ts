/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 7/1/2017.
 */

import { Inject, Directive, ElementRef } from '@angular/core';
import { UiIcon, IconFontType } from './icon';

@Directive({
    selector: '[uiIcon]',
})
export class UiIconDirective extends UiIcon {

    constructor(@Inject("FONT_TYPE")fontType: IconFontType = 'fa', el: ElementRef) {

        super(fontType, el);
    }

    public addIconClass(className: string) {

        this.el.classList.add(className);
    }

    public removeIconClass(className: string) {

        this.el.classList.remove(className);
    }
}
