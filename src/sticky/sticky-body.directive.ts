/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 5/19/2017.
 */

import { Directive, ElementRef, Input, Output, HostListener, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { PositionUtils } from '../common/utils/position-utils';
import { UiStickyService, IStickySubject } from './sticky.service';
import { Observable, Subscription } from 'rxjs/Rx';
import 'rxjs/add/observable/fromEvent';

// const STICKY_DEBOUNCE_DELAY: number = 250;

@Directive({
    selector: '[stickyBody]',
    providers: [UiStickyService]
})
export class UiStickyBodyDirective implements OnInit, OnDestroy {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _sticky: boolean = false;
    private _stickyHeight: number = 0;
    private _subscriptions: Subscription[] = [];

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input("stickyBody")
    enabled: boolean = true;   // enable/disable this directive

    @Input()
    stickyTop: number;

    @Input()
    stickyContainer: string = 'body';

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private _element: ElementRef,
                private _stickyService: UiStickyService) {
    }

    // -------------------------------------------------------------------------
    // Lifecycle listeners
    // -------------------------------------------------------------------------

    // implements OnInit
    ngOnInit(): void {
        let stickyContainerElement: HTMLElement = null;
        if (!!this.stickyContainer && this.stickyContainer !== 'body') {
            stickyContainerElement = <HTMLElement>document.querySelector(this.stickyContainer);
        }
        const targetElement = stickyContainerElement || window;

        this._subscriptions.push(Observable
            .fromEvent(targetElement, 'scroll')
            // .throttleTime(STICKY_DEBOUNCE_DELAY)
            .subscribe((event) => {
                this._checkSticky();
            })
        );
        this._subscriptions.push(Observable
            .fromEvent(targetElement, 'resize')
            // .throttleTime(STICKY_DEBOUNCE_DELAY)
            .subscribe((event) => {
                // force to calculate the size again
                this._checkSticky(true);
            })
        );

        // subscribe to table changing observable (changes in  filtering and sorting)
        this._subscriptions.push(this._stickyService.getStateChanged()
            .filter((value: IStickySubject) => value && value.event === 'sizeUpdate')
            .subscribe((value: IStickySubject) => {
                if (!!value.stickyHeight)
                    this._stickyHeight = value.stickyHeight;

            })
        );
    }

    // implements OnDestroy
    ngOnDestroy(): void {
        // unsubscribe
        this._subscriptions.forEach(sub => sub.unsubscribe());
        this._subscriptions.length = 0;
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private _checkSticky(force: boolean = false) {
        if (!this.enabled)
            return;

        let clientRect: ClientRect =
            PositionUtils.positionWithScrolling(this._element.nativeElement, true);
        let contentTop: number = clientRect.top;
        let contentBottom: number = clientRect.bottom;

        //             + ',contentTop=' + contentTop + ',contentBottom=' + contentBottom);
        if ((this.stickyTop > contentTop) && (this.stickyTop < contentBottom - this._stickyHeight)) {
            if (!this._sticky || force) {

                this._sticky = true;
                this._stickyService.notify({
                    event: 'stickyUpdate',
                    sticky: true,
                    stickyTop: this.stickyTop,
                    contentTop: contentTop,
                    contentBottom: contentBottom
                });
            }
        }
        else if (this._sticky || force) {

            this._sticky = false;
            this._stickyService.notify({
                event: 'stickyUpdate',
                sticky: false
            });
        }
    }
}