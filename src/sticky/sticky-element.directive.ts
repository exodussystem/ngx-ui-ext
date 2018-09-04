/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 5/25/2017.
 */

import { Directive, Input, ElementRef, ViewContainerRef, OnDestroy, AfterContentInit, OnInit } from '@angular/core';
import { PositionUtils } from '../common/utils/position-utils';
import { UiStickyService, IStickySubject } from './sticky.service';
import { Observable, Subscription } from 'rxjs/Rx';
import 'rxjs/add/observable/fromEvent';

@Directive({
    selector: '[stickyElement]'
})
export class UiStickyElementDirective implements AfterContentInit, OnDestroy, OnInit {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _visible: boolean = false;
    private _stickyTop: number;
    private _stickyHeight: number = 0;
    private _contentTop: number;
    private _contentBottom: number;
    private _stickyElement: HTMLElement = null;
    private _sourceElement: HTMLElement = null;
    private _subscription: Subscription;
    private _events: Array<string>;
    private _eventHandlers: Array<Subscription>;

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input('stickyElement')
    enabled: boolean = true;        // enable/disable this directive

    @Input('stickyClass')
    stickyClass: string;            // class/es added when element got stuck (etc 'stickyOn')
                                    // this class can be used to show/hide child elements within sticky element
    @Input('stickyCloned')
    stickyCloned: boolean = false;  // indicate sticky on cloned element

    @Input('stickyEvents')          // window events that require synchronization
    set stickyEvents(value: string) {
        if (!!value && value.length > 0) {
            this._events = value.split(',');
        }
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private _viewContainerRef: ViewContainerRef,
                private _element: ElementRef,
                private _stickyService: UiStickyService) {

    }

    // -------------------------------------------------------------------------
    // Lifecycle listeners
    // -------------------------------------------------------------------------

    // implements OnInit
    ngOnInit(): void {
        if (!this.enabled)
            return;

        // if sticky on cloned element, it should be hidden
        if (this.stickyCloned) {
            this._hideSticky(this._element.nativeElement);
        }
        // subscribe to table changing observable (changes in  filtering and sorting)
        this._subscription = this._stickyService.getStateChanged()
            .filter((value: IStickySubject) => value && value.event === 'stickyUpdate')
            .subscribe((value: IStickySubject) => {

                this._visible = value && !!value.sticky;
                if (this._visible) {
                    this._stickyTop = value.stickyTop;
                    this._contentTop = value.contentTop;
                    this._contentBottom = value.contentBottom;
                }
                this._showSticky();
            });
    }

    // implements AfterContentInit
    ngAfterContentInit(): void {
        if (this.enabled) {
            setTimeout(() => {
                // if sticky on cloned element, lookup the source element
                if (this.stickyCloned) {
                    this._getSourceElement();
                }
                else {
                    // if sticky on host element, clone element
                    this._cloneSourceElement();
                }
                // at this point, we have source and sticky element
                // now we need to bind events to the sticky element
                this._initEventHandlers();
            });
        }
    }

    // implements OnDestroy
    ngOnDestroy(): void {
        // unsubscribe
        if (this._subscription)
            this._subscription.unsubscribe();

        if (this._stickyElement) {
            // destroy sticky element if it has been cloned
            if (!this.stickyCloned && this._stickyElement)
                this._stickyElement.remove();
            this._stickyElement = null;
        }
        // release reference to source element
        if (this._sourceElement) {
            this._sourceElement = null;
        }

        this._removeEventHandlers();
    }

    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------

    private _getSourceElement() {
        if (this._sourceElement)
            return;

        let sourceNode: Node = this._viewContainerRef.element.nativeElement.previousSibling;
        while (sourceNode.nodeType !== Node.ELEMENT_NODE && sourceNode.previousSibling) {
            sourceNode = sourceNode.previousSibling;
        }
        if (sourceNode && sourceNode.nodeType === Node.ELEMENT_NODE)
            this._sourceElement = sourceNode as HTMLElement;

        this._stickyElement = this._element.nativeElement;

        if (this._visible)
            this._showSticky();
    }

    private _cloneSourceElement() {
        if (this._stickyElement)
            return;

        this._sourceElement = this._element.nativeElement;

        const containerNode: HTMLElement =
            this._viewContainerRef.element.nativeElement.parentNode;
        const newNode: Node = this._sourceElement.cloneNode(true);
        containerNode.appendChild(newNode);
        this._stickyElement = newNode as HTMLElement;
        this._stickyElement.innerHTML = this._element.nativeElement.innerHTML;

        // make it hidden after created
        this._hideSticky(this._stickyElement)

        // if sticky was sent earlier (before cloned element is created)
        if (this._visible)
            this._showSticky();
    }

    private _showSticky() {
        if (!this.enabled || !this._stickyElement)
            return;
        if (this._visible) {
            this._synchElementSize(this._sourceElement, this._stickyElement);

            // add class if provided
            if (!!this.stickyClass && this.stickyClass.length > 0)
                this._stickyElement.classList.add(this.stickyClass);

            this._stickyElement.style.visibility = 'visible';
        }
        else {
            // remove class if provided
            if (!!this.stickyClass && this.stickyClass.length > 0)
                this._stickyElement.classList.remove(this.stickyClass);

            this._stickyElement.style.visibility = 'hidden';
        }
    }

    private _synchElementSize(source: HTMLElement, target: HTMLElement) {
        let clientRect: ClientRect =
            PositionUtils.positionWithScrolling(source, false);
        target.style.top = this._stickyTop + 'px';
        target.style.height = clientRect.height + 'px';
        target.style.width = clientRect.width + 'px';
        target.style.left = clientRect.left + 'px';

        // if synchronizing table row,
        // then synchronize dimensions of all columns
        if (target.tagName === 'TR') {
            this._synchColumnHeaderSizes(source, target);
        }
        // detect height change
        if (this._stickyHeight !== clientRect.height) {
            // update height
            this._stickyHeight = clientRect.height;
            // notify height change
            this._stickyService.notify({
                event: 'sizeUpdate',
                stickyHeight: clientRect.height,
                sticky: this._visible
            });
        }
    }

    private _synchColumnHeaderSizes(source: HTMLElement, target: HTMLElement) {
        let sourceColumns: NodeListOf<Element> = source.querySelectorAll('th');
        let clonedColumns: NodeListOf<Element> = target.querySelectorAll('th');
        if (clonedColumns && sourceColumns && clonedColumns.length == sourceColumns.length) {
            for (let i = 0; i < sourceColumns.length; i++) {
                let sourceNode: Node = sourceColumns[i];
                let clonedNode: Node = clonedColumns[i];

                // Make sure it's really an HTML element
                if (sourceNode.nodeType == Node.ELEMENT_NODE &&
                    clonedNode.nodeType == Node.ELEMENT_NODE) {
                    let sourceElement: HTMLElement = sourceNode as HTMLElement;
                    let clonedElement: HTMLElement = clonedNode as HTMLElement;

                    // Use computed style
                    // let elementStyles = window.getComputedStyle(sourceElement);
                    // clonedElement.style.width = elementStyles.width;
                    // clonedElement.style.height = elementStyles.height;

                    // use client width
                    // clonedElement.style.width = sourceElement.clientWidth + 'px';
                    // clonedElement.style.height = sourceElement.clientHeight + 'px';

                    let clientRect: ClientRect = sourceElement.getBoundingClientRect();
                    clonedElement.style.width = clientRect.width  + 'px';
                    clonedElement.style.height = clientRect.height + 'px';
                }
            }
        }
    }

    private _hideSticky(sticky: HTMLElement) {
        if (!sticky)
            return;
        sticky.style.position = 'fixed';
        sticky.style.zIndex = '997';
        sticky.style.visibility = 'hidden';
    }

    private _initEventHandlers() {
        if (!this._events || this._events.length === 0)
            return;

        let hasMouseEvent: boolean = false;
        this._eventHandlers = [];
        this._events.forEach((eventName: string) => {
            // we handle these mouse events differently
            if (!eventName
                || eventName === 'mousedown'
                || eventName === 'mouseup'
                || eventName === 'mousemove'
                || eventName === 'mousedrag') {
                hasMouseEvent = true;
                return null;
            }
            this._eventHandlers.push(
                Observable.fromEvent(this._stickyElement, eventName)
                    .subscribe((event) => {

                        this._synchElementSize(this._sourceElement, this._stickyElement);
                    })
            );
        })
        // handling mouse drag
        if (hasMouseEvent) {
            const mouseDown$ = Observable.fromEvent(this._stickyElement, 'mousedown');
            if (this._events.indexOf('mousedown') > -1) {

                this._eventHandlers.push(
                    mouseDown$.subscribe((event) => {
                        this._synchElementSize(this._sourceElement, this._stickyElement);
                    }));
            }
            const mouseMove$ = Observable.fromEvent(this._stickyElement, 'mousemove');
            if (this._events.indexOf('mousemove') > -1) {

                this._eventHandlers.push(
                    mouseMove$.subscribe((event) => {
                        this._synchElementSize(this._sourceElement, this._stickyElement);
                    }));
            }
            const mouseUp$ = Observable.fromEvent(this._stickyElement, 'mouseup');
            if (this._events.indexOf('mouseup') > -1) {

                this._eventHandlers.push(
                    mouseUp$.subscribe((event) => {
                        this._synchElementSize(this._sourceElement, this._stickyElement);
                    }));
            }

            if (this._events.indexOf('mousedrag') > -1) {

                const moveUntilMouseUp$= mouseMove$.takeUntil(mouseUp$);
                const mouseDrag$ = mouseDown$.switchMapTo(moveUntilMouseUp$.startWith(null));
                this._eventHandlers.push(
                    mouseDrag$.subscribe((event) => {
                        this._synchElementSize(this._sourceElement, this._stickyElement);
                    }));
            }
        }
    }

    private _removeEventHandlers() {
        if (this._eventHandlers && this._eventHandlers.length > 0) {
            this._eventHandlers.forEach((handler: Subscription) => {
                handler && handler.unsubscribe();
            });
            this._eventHandlers.splice(0, this._eventHandlers.length);
            this._eventHandlers = null;
        }
    }
}