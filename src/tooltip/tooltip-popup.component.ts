/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 1/13/2017.
 */

import { Component, Input, ElementRef, ChangeDetectorRef, OnInit } from '@angular/core';
import { PositionUtils } from '../common/utils/position-utils';
import { Response, Http } from '@angular/http';

@Component({
    selector: "ui-tooltip-content",
    template: `
<div class="tooltip {{ placement }}"
     [style.top]="top + 'px'"
     [style.left]="left + 'px'"
     [class.in]="isIn"
     [class.fade]="isFade"
     role="tooltip">
    <div class="tooltip-arrow"></div> 
    <div class="tooltip-inner">
        <ng-content></ng-content>
        {{ content }}
    </div> 
</div>
`
})
export class UiTooltipPopupComponent implements OnInit {

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input()
    hostElement: HTMLElement;

    @Input()
    content: string;

    @Input()
    placement: "top"|"bottom"|"left"|"right" = "bottom";

    @Input()
    animation: boolean = true;

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    top: number = -100000;
    left: number = -100000;
    isIn: boolean = false;
    isFade: boolean = false;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private _element: ElementRef,
                private _cdr: ChangeDetectorRef,
                private _http: Http) {
    }

    // -------------------------------------------------------------------------
    // Lifecycle callbacks
    // -------------------------------------------------------------------------

    // implements OnInit
    ngOnInit(): void {
        // this.show();
        this._cdr.detectChanges();
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    show(): void {
        if (!this.hostElement)
            return;

        const p = PositionUtils.positionElements(
                        this.hostElement,
                        this._element.nativeElement.children[0],
                        this.placement);
        this.top = p.top;
        this.left = p.left;
        this.isIn = true;
        if (this.animation)
            this.isFade = true;
    }

    hide(): void {
        // this.element.nativeElement.style.top = '-100000px';
        // this.element.nativeElement.style.left = '-100000px';
        this.top = -100000;
        this.left = -100000;
        this.isIn = true;
        if (this.animation)
            this.isFade = false;
    }

    /**
     * Async content to be displayed as tooltip. If falsy, the tooltip won't open.
     */
    @Input()
    set contentUrl(url: string) {
        this._http.get(url)
            .map( (response: Response) => response.text() )
            .subscribe(
                data => { this.content = <string>data },
                err => console.error(err)
            );
    }
}
