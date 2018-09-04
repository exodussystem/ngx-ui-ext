/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 7/1/2017.
 */

import { Inject, Component, ElementRef, Input, SimpleChange, ViewEncapsulation } from '@angular/core';
import { UiIcon, IconFontType } from './icon';

@Component({
    selector: 'ui-icon',
    template: `
      <i [ngClass]="classList"></i>
    `,
    encapsulation: ViewEncapsulation.None,

})
export class UiIconComponent extends UiIcon {

    public classList: Array<string>;

    constructor(@Inject("FONT_TYPE")fontType: IconFontType = 'fa', el: ElementRef) {
        super(fontType, el);
    }

    addIconClass(className: string): void {
        if (!this.classList)
            this.classList = [];

        // check uniqueness
        let index: number = this.classList.indexOf(className);
        if (index === -1)
            this.classList.push(className);
    }

    removeIconClass(className: string): void {
        if (!this.classList)
            this.classList = [];

        let index: number = this.classList.indexOf(className);
        if (index >= 0) {
            this.classList.splice(index, 1);
        }
    }
}