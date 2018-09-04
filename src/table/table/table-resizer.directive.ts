/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 3/22/2017.
 */

import { Component, ElementRef, HostBinding, Inject, Input } from '@angular/core';
import { ITableColumn } from '../config/column-config';
import { IconFontType } from '../../icon/icon';

@Component({
    selector: '[uiTableResizer]',
    template: `<div></div>`,
    host: {
        '(click)': 'stopClick($event)',
        '(mousedown)': 'grab($event)',
        '[class]' : '\'font-type-\' + fontType',
        '[attr.title]': '"Click-and-drag to resize. Click to clear specified width."'
    },
    styles: [`
        :host {
            cursor: w-resize !important;
            line-height: inherit;
            display: inline-block;
        }
        :host:after {
            content: "";
            line-height: 1;
            background: transparent none repeat scroll 0 0;
            color: #fff;
            cursor: w-resize !important;
            display: inline-block;
            height: 100%;
            position: absolute;
            right: -5px;
            top: 0;
            margin-top: -4px;
            z-index: 2;
            opacity: 0;
        }

        :host(:hover):after {
            opacity: 0.6;
        }

        /* Font-Awesome - fa-caret-down */
        :host:after,
        :host.font-type-fa:after {
            content: "\\f0d7";
            font-family: 'FontAwesome';
        }
        
        /* Bootstrap Glyphicon - glyphicon-triangle-bottom */
        :host.font-type-glyphicon:after {
            content: "\\e252";
            font-family: "Glyphicons Halflings";
            font-size: 80%;
        }
  `]
})
export class UiTableResizerDirective {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private static MAX_CLICK_WAIT: number = 250;
    private static MIN_COLUMN_WIDTH: number = 30;

    protected fontType: IconFontType = 'fa';

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input()
    public column: ITableColumn;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(@Inject("FONT_TYPE")fontType: IconFontType = 'fa',
                private _element: ElementRef) {
        this.fontType = fontType || 'fa';
    }

    grab(grabEvt: MouseEvent): void {
        this.stopClick(grabEvt);

        let mousedownTime: number = Date.now();
        let initClientX: number = grabEvt.clientX;
        let currentWidth = // parse column width in px
            (this.column.width && this.column.width.endsWith('px'))
            ? parseInt(this.column.width, 10)
            : null;

        let initWidth: number = currentWidth || this._element.nativeElement.parentElement.offsetWidth;

        // prevent Global MouseEvents
        let previousEvents: string = document.body.style['pointer-events'];
        let previousCursor: string = document.body.style['cursor'];
        document.body.style['cursor'] = 'w-resize !important';
        document.body.style['pointer-events'] = 'none';

        let drag: EventListener = (event: MouseEvent): void => {
            this.stopClick(event);
            let change: number = event.clientX - initClientX;
            this.column.width = Math.max(initWidth + change, UiTableResizerDirective.MIN_COLUMN_WIDTH) + 'px';
        };

        let unbindDrag: EventListener = (event: MouseEvent): void => {
            this.stopClick(event);
            document.removeEventListener('mousemove', drag, true);
            document.removeEventListener('mouseup', unbindDrag, true);
            // if just a click without holding and dragging
            if (Date.now() - mousedownTime < UiTableResizerDirective.MAX_CLICK_WAIT) {
                // reset the column width (set to auto)
                this.column.width = null;
            }
            // restore Global Mouse Events
            document.body.style['pointer-events'] = previousEvents;   //'auto'
            document.body.style['cursor'] = previousCursor;
        };
        document.addEventListener('mousemove', drag, true);
        document.addEventListener('mouseup', unbindDrag, true);
    }

    stopClick(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
    }
}