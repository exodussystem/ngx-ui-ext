/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 3/24/2017.
 */

import {
    Component,
    ElementRef,
    ViewContainerRef,
    ViewChild,
    TemplateRef,
    Optional,
    OnDestroy,
    AfterViewInit,
    OnInit, Output, EventEmitter, HostListener
} from '@angular/core';
import { NgControl, NgModel, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs/Rx';
import { DomUtils } from '../common/utils/dom-utils';
import { Key } from '../common/utils/key-utils';

@Component({
    selector: '[uiReset]',
    template: `
        <ng-template #uiResetTemplate>
        <div *ngIf="visible" class="btn-wrapper" [style.top]="topPos">
            <span uiIcon [name]="'remove'" class="btn-clear" (click)="clearInput($event)"></span>
        </div>
        </ng-template>
    `,
    host: {
        '[class.is-dirty]': 'visible',
        '[class.has-placeholder]': 'placeholder'
    },
    styles: [`
        .btn-wrapper {
            float: right;
            position: relative;
            display: inline-block;
            right: 20px;
        }
        .btn-clear[uiIcon] {
            position: absolute;
            z-index: 10;
            height: 14px;
            margin: auto;
            font-size: 13px;
            cursor: pointer;
            color: #ccc;
        }
        .btn-clear:hover {
            color: #843534;
        }
        /* hide the reset button when input is readonly or disabled */
        :host[disabled] ~ .btn-wrapper,
        :host[readonly] ~ .btn-wrapper {
	        display: none !important;
        }
        :host {
            display: inline-block;
            margin-right: -15px;
        }
    `]
})
export class UiInputResetDirective implements OnInit, AfterViewInit, OnDestroy {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    @Output()
    inputReset: EventEmitter<any> = new EventEmitter();

    @ViewChild('uiResetTemplate')
    resetTemplateRef: TemplateRef<any>;

    private _inputValue: string = '';
    private _subscriptions: Subscription[] = []; // subscriptions that listening to events
    public visible: boolean = false;
    public placeholder: boolean = false;
    public topPos: string;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(@Optional() private _control: NgControl,
                @Optional() private _model: NgModel,
                private _element: ElementRef,
                private _viewContainer: ViewContainerRef) {
        this.placeholder = this._element.nativeElement.getAttribute('placeholder');
    }

    // -------------------------------------------------------------------------
    // Lifecycle callbacks
    // -------------------------------------------------------------------------

    // implements OnInit
    ngOnInit() {
        this.topPos = (this._element.nativeElement.clientHeight - 14)/2 + 'px';
        // initialize visible status
        this._onValueChange(this._element.nativeElement.value);
        if (this._viewContainer.length > 1) {
            // create embedded view right next to input
            let index: number = DomUtils.getElementIndex(this._element.nativeElement);
            this._viewContainer.createEmbeddedView(this.resetTemplateRef, null, ++index);
        }
        else {
            this._viewContainer.createEmbeddedView(this.resetTemplateRef);
        }
    }

    // implements AfterContentInit
    ngAfterViewInit() {
        this._subscriptions.push(this._listenToModelChange());
    }

    // implements OnDestroy
    ngOnDestroy() {
        // unsubscribe all subscriptions
        this._subscriptions.forEach(sub => sub.unsubscribe());
        this._subscriptions.length = 0;
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    @HostListener('keydown', ['$event'])
    public handleClick(event: KeyboardEvent): void {

        switch (event.keyCode) {
            case Key.Escape: {
                this.clearInput(event);
            }
        }
    }

    clearInput(event: Event): void {
        if (event)
            event.stopPropagation();
        if (this._control) {
            this._control.control.reset('');
        }
        else if (this._model) {
            this._model.reset('');
        }
        else {
            this._element.nativeElement.value = '';
        }
        this._element.nativeElement.focus();
        this._inputValue = '';
        this.visible = false;
        this.inputReset.emit(null);
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private _listenToModelChange(): Subscription {
        // form-driven
        if (this._model) {
            return this._model.valueChanges.subscribe((newValue) => {
                this._onValueChange(newValue);
            });
        }
        // reactive form (model-driven)
        else if (this._control) {
            return (this._control.control as FormControl).valueChanges.subscribe((newValue) => {
                this._onValueChange(newValue);
            });
        }
        // if neither ngModel nor ngFormControl available, listen to keyup event
        else {
            return Observable
                .fromEvent(this._element.nativeElement, 'keyup')
                .map((event: any) => event.target.value)
                .subscribe((newValue) => {
                    this._onValueChange(newValue);
                });
        }
    }

    private _onValueChange(newValue) {
        this._inputValue = newValue || '';
        this.visible = this._inputValue && this._inputValue.length > 0;
    }
}