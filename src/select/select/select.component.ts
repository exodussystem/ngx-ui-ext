import {
    AfterViewInit,
    ApplicationRef,
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    ElementRef,
    EventEmitter,
    HostListener,
    Injector,
    Input, OnChanges,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { AbstractControl, ControlValueAccessor, Validator } from '@angular/forms';
import { Observable, Subscription } from 'rxjs/Rx';
import { Key } from '../../common/utils/key-utils';
import { ValidatorProviderFactory, ValueAccessorProviderFactory } from '../../common/utils/provider-utils';
import { UiSelectPopupComponent } from './select-popup.component';
import { ISelectEvent, UiSelectState } from './select.state';
import { ISelectSettings } from './select.interface';

@Component({
    selector: 'ui-select',
    entryComponents: [UiSelectPopupComponent],
    providers: [
        ValueAccessorProviderFactory(UiSelectComponent),
        ValidatorProviderFactory(UiSelectComponent),
        UiSelectState
    ],
    template: `
        <div class="dropdown">
            <button id="{{id}}" type="button" class="form-control btn btn-select {{state.settings.buttonClass}}"
                    #uiSelectButton
                    [ngClass]="{
                        'placeholder': state.totalSelected === 0,
                        'is-dirty': state.totalSelected > 0,
                        'is-disabled': !enabled,
                        'is-focused': hasFocus,
                        'has-placeholder': placeholder
                    }"
                    (click)="togglePopup()" [disabled]="!enabled">
                <span>{{ selectionText }}</span>
                <span class="caret" [class.caret-reversed]="isVisible"></span>
            </button>
            <a *ngIf="state.settings.allowClear && state.totalSelected > 0"
               class="btn btn-xs btn-link btn-clear pull-right"
               tabindex="-1" aria-label="Click to clear selection" href (click)="clearSelection($event)">
                <ui-icon name="remove"></ui-icon>
            </a>
            <ng-content></ng-content>
        </div>
    `,
    styles: [`
        :host {
            position: relative;
            width: 100%;
        }
        .btn.btn-select {
            text-align: left;
            /*
            background-color: #fff;
            border-color: #ccc;
            */
        }
        .btn.btn-select:focus {
            border-color: #66afe9;
        }
        .btn.placeholder > span:first-child {
            overflow: hidden;
            white-space: nowrap;
            color: #8e8e8e;
        }
        .btn.btn-select > span:first-child {
            overflow: hidden;
            text-overflow: ellipsis;
            display: inline-block;
            width: calc(100% - 12px);
            padding-right: 12px;
        }
        .btn .caret {
            float: right !important;
            margin-top: 5px;
            /*padding-bottom: 5px;*/
            color: #222222;
        }
        /* fix caret position on FF */
        @-moz-document  url-prefix() {
            .btn .caret {
                margin-top: -10px !important;
            }
        }
        .caret-reversed {
            /*padding-bottom: 0px !important;*/
            -ms-transform: rotate(180deg);
            -webkit-transform: rotate(180deg);
            transform: rotate(180deg);
        }
        a.btn.btn-clear {
            display: inline-block;
            position: relative;
            padding: 0;
            margin-right: 25px;
            margin-top: -26px;
            z-index: 10;
            cursor: pointer;
            color: #ccc;
        }
         a.btn.btn-clear:hover {
            color: #843534;
        }
    `]
})
export class UiSelectComponent
    implements OnInit, AfterViewInit, OnDestroy, OnChanges, ControlValueAccessor, Validator {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    protected state: UiSelectState;
    protected hasFocus: boolean = false;
    protected isVisible: boolean = false;
    protected selectionText: string;

    private _enabled: boolean = true;
    private _popup: ComponentRef<UiSelectPopupComponent>;
    private _subscriptions: Subscription[] = []; // subscriptions that listening to events

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input()
    id: string;

    @Input()
    placeholder: string;

    @Input()
    set enabled(value: boolean) {
        this._enabled = value;
    }

    get enabled(): boolean {
        return this._enabled;
    }

    @Input()
    set multiple(value: boolean) {
        this.state.multiple = value;
    }

    get multiple(): boolean {
        return this.state.multiple;
    }

    @Input()
    set options(value: Array<any>) {
        this.state.setOptions(value);
    }

    @Input()
    set settings(value: ISelectSettings) {
        this.state.setSettings(value);
    }

    @Input("uiSelectItemTemplate")
    set itemTemplate(value: TemplateRef<any>) {
        this.state.itemTemplate = value;
    }

    @Input("uiSelectOptionsTemplate")
    set optionsTemplate(value: TemplateRef<any>) {
        this.state.optionsTemplate = value;
    }

    @Output() selectionLimitReached: EventEmitter<any> = new EventEmitter();
    @Output() selectionAdded: EventEmitter<any> = new EventEmitter();
    @Output() selectionRemoved: EventEmitter<any> = new EventEmitter();
    @Output() selectionChange: EventEmitter<any> = new EventEmitter();

    @ViewChild('uiSelectButton', {read: ElementRef})
    private _selectElement: ElementRef;

    @ViewChild('uiSelectButton', {read: ViewContainerRef})
    private _viewContainer: ViewContainerRef;

    // check if use clicks outside of input and popup
    @HostListener('document: click', ['$event.target'])
    onClickOutside(target: HTMLElement) {
        // would not bother if popup is not opened
        if (!this.isVisible) {
            this.hasFocus = false;
            return;
        }

        // find if the click event is targeted to this component or the popup container component
        if (!this._element.nativeElement.contains(target) &&
            (!this._popup || !this._popup.location.nativeElement.contains(target))) {
            this._onHide(false, false);
            this.hasFocus = false;
        }
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private _element: ElementRef,
                private _resolver: ComponentFactoryResolver,
                private _applicationRef: ApplicationRef,
                private _defaultInjector: Injector) {
        this.state = new UiSelectState();
    }

    // -------------------------------------------------------------------------
    // Lifecycle callbacks
    // -------------------------------------------------------------------------

    // implements OnInit
    ngOnInit() {
        this._element.nativeElement.removeAttribute("id");
        this.selectionText = this.placeholder || '';
    }

    // implements AfterViewInit
    ngAfterViewInit() {
        this._subscriptions = [
            this._listenToFocusChange(),        // user pressed 'Tab'/'Esc'
            this._listenToKeySelection(),       // user pressed 'Enter'
            this._listenToKeyNavigation(),      // user moves up/down with arrow
            this._listenToMouseNavigation(),    // user scroll with mouse wheel
            this._listenToPopupUpdate(),         // popup update : user click on option,...
            this._listenToFocusGain(),
            this._listenToFocusLose()
        ];
    }

    // implements OnChanges
    ngOnChanges(changes: any) {
        // any change of options will result to update of matches
        if (changes.options && !changes.options.isFirstChange()) {
            this.state.generateMatches(true); // true - force regenerating
        }
    }

    // implements OnDestroy
    ngOnDestroy() {
        // unsubscribe all subscriptions
        this._subscriptions.forEach(sub => sub.unsubscribe());
        this._subscriptions.length = 0;

        this.state.onDestroy();
    }

    // implements Validator
    validate(abstractControl: AbstractControl): { [key: string]: any; } {
        if (abstractControl && abstractControl.validator) {
            const validator = abstractControl.validator( {} as AbstractControl );
            let model: any = this.state.getSelections();

            // if required is found
            if (validator && validator.required) {
                // multiple mode
                if (this.state.multiple) {
                    // check 'required' validation
                    if (!model || model.length === 0) {
                        return {required: {valid: false}};
                    }
                }
                // single mode - only check 'required' validation
                else if (!model || model.toString().length === 0) {
                    return {required: {valid: false}};
                }
            }
            if (this.state.multiple && validator
                && (validator.minlength || validator.maxlength)) {

                let length: number = model.length;
                // check 'minlength' validation
                if (validator.minlength
                    && this.state.settings.minSelection > 0
                    && length < this.state.settings.minSelection) {
                    return {minlength: {valid: false, min: this.state.settings.minSelection, actual: length}};
                }

                // check 'maxlength' validation
                if (validator.maxlength
                    && this.state.settings.maxSelection > 0
                    && length > this.state.settings.maxSelection) {
                    return {maxlength: {valid: false, max: this.state.settings.maxSelection, actual: length}};
                }
            }
        }
        return null;
    }

    // implements Validator
    registerOnValidatorChange(fn: () => void): void {
        // throw new Error('Method not implemented.');
    }

    //
    // implements ControlValueAccessor
    //
    onModelChange: Function = (_: any) => {
    };
    onModelTouched: Function = () => {
    };

    writeValue(value: any): void {
        if (value === undefined) {
            return;
        }
        if (this.state.setSelections(value)) {
            this._onModelChange();
        }
    }

    registerOnChange(fn: Function): void {
        this.onModelChange = fn;
    }

    registerOnTouched(fn: Function): void {
        this.onModelTouched = fn;
    }

    setDisabledState(isDisabled: boolean) {
        this._enabled = !isDisabled;
    }

    // -------------------------------------------------------------------------
    // Public Methods (Public API)
    // -------------------------------------------------------------------------

    clearSelection(event: Event): void {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        // deselect all
        this.state.deselectAll();
        // and set focus on select component
        this.focus();
    }

    showPopup(): void {
        // open the popup
        this._openPopup();
    }

    hidePopup(): void {
        // close the popup
        // force: false (so animation will be triggered if enabled)
        // setFocus: true (set focus after closing popup)
        this._onHide(false, true);
    }

    togglePopup(): void {
        this.isVisible
            ? this.hidePopup()   // hide popup
            : this.showPopup();  // show the popup
    }

    focus(): void {
        // set focus on select component
        this._selectElement.nativeElement.focus();
        this.hasFocus = true;
    }

    isOpened(): boolean {
        return this.isVisible;
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    // listen to events triggered from popup component
    private _listenToPopupUpdate(): Subscription {
        return this.state.selectionChange$
            .filter((event: ISelectEvent) => event && event.source==='popup')
            .subscribe((event: ISelectEvent) => {
                if (event.eventName === 'selectionAdded') {
                    this.selectionAdded.emit(event.options);
                }
                else if (event.eventName === 'selectionRemoved') {
                    this.selectionRemoved.emit(event.options);
                }
                else if (event.eventName === 'limitReached') {
                    this.selectionLimitReached.emit(event.options);
                }
                if (event.eventName === 'selectionUpdated') {
                    this._onSelectionChange();
                }
                else if (event.eventName==='closePopup') {
                    // force to close popup
                    this._onHide(true, event.setFocus);
                }
            });
    }

    // listen to user select when user press ENTER on an active item in the popup
    private _listenToKeySelection(): Subscription {
        return Observable.fromEvent(this._selectElement.nativeElement, 'keydown')
            .filter((event: KeyboardEvent) => event.keyCode === Key.Enter)
            .subscribe((event: KeyboardEvent) => {
                // ONLY if popup is currently opened and user clicks Enter
                if (this.isVisible) {
                    // prevent to submit form
                    event.stopPropagation();
                    event.preventDefault();

                    // select the current active option item
                    if (this.state.active) {
                        this.state.select(this.state.active);
                    }
                }
            });
    }

    // listen to focus change (etc. user press TAB/ESC)
    private _listenToFocusChange(): Subscription {
        return Observable.fromEvent(this._selectElement.nativeElement, 'keydown')
            .filter((event: KeyboardEvent) => event.keyCode === Key.Escape || event.keyCode === Key.Tab)
            .subscribe((event: KeyboardEvent) => {
                // if forward tabbing while filter text-box is shown, set the focus to filter text-box
                if (this.isVisible && event.keyCode === Key.Tab
                    && !event.shiftKey && this.state.settings.enableSearch) {
                    event.stopPropagation();
                    event.preventDefault();
                    this.state.notifyChange({source: 'input',eventName: 'focusChanged'});
                }
                else {
                    // otherwise:
                    // - popup was NOT opened OR
                    // - user pressed ESCAPE
                    // - user pressed SHIFT+TAB

                    // just close popup if it is currently opened
                    // set focus ONLY if user pressed ESCAPE
                    this._onHide(false, event.keyCode === Key.Escape);
                }
                return false;
            });
    }

    // Listening to gaining focus event
    private _listenToFocusGain(): Subscription {
        return Observable.fromEvent(this._selectElement.nativeElement, 'focus')
            .subscribe((event: any) => {
                this.hasFocus = true;
            });
    }

    // Listening to losing focus event
    private _listenToFocusLose(): Subscription {
        return Observable.fromEvent(this._selectElement.nativeElement, 'blur')
            .subscribe((event: any) => {
                if (!this.isVisible)
                    this.hasFocus = false;
            });
    }

    // listen to arrow key (Up/Down)
    private _listenToKeyNavigation(): Subscription {
        return Observable.fromEvent(this._selectElement.nativeElement, 'keydown')
            .filter((event: KeyboardEvent) => event.keyCode === Key.ArrowDown || event.keyCode === Key.ArrowUp)
            .subscribe((event: KeyboardEvent) => {
                event.stopPropagation();
                event.preventDefault();

                // if popup is not opened yet
                if (!this.isVisible) {
                    if (this.state.multiple) {
                        // open popup to let user select from results
                        this._openPopup();
                    }
                    else {  // single mode
                        // select previous or next option
                        this._onNavigationSelect(event.keyCode === Key.ArrowUp,
                                                 event.keyCode === Key.ArrowDown);
                    }
                }
                else { // if it is currently opened, go to previous / next match
                    if (event.keyCode === Key.ArrowDown) {
                        this.state.activateNextMatch();
                    }
                    else if (event.keyCode === Key.ArrowUp) {
                        this.state.activatePreviousMatch();
                    }
                }
            });
    }

    // listen to mouse wheel - only support single selection mode
    private _listenToMouseNavigation(): Subscription {
        if (this.state.multiple)
            return null;
        return Observable.fromEvent(this._selectElement.nativeElement, 'wheel')
            .subscribe((event: MouseWheelEvent) => {
                if (this.hasFocus) {
                    event.stopPropagation();
                    event.preventDefault();
                    // if popup is not opened yet
                    if (!this.isVisible) {
                        this._onNavigationSelect(event.deltaY < 0, event.deltaY > 0);
                    }
                }
            });
    }

    // handler when move to next/previous option item (etc: arrow key up/down or mouse wheel)
    // only support single selection mode
    private _onNavigationSelect(moveUp: boolean, moveDown: boolean) {
        // prepare matched options before navigating next/previous
        this._initMatches();

        let change: boolean = false;
        if (!this.state.active && this.state.selected.length > 0) {
            this.state.active = this.state.selected[0];
        }
        if (moveUp) {
            change = this.state.activatePreviousMatch();
        }
        else if (moveDown) {
            change = this.state.activateNextMatch();
        }
        if (change && this.state.active)
            this.state.select(this.state.active);
    }

    //  handler when selection changes (etc user clicks or enter...)
    private _onSelectionChange() {
        // update model
        this._onModelChange();

        // if there is no filter, keep the focus on the select input component
        if (!this.state.settings.enableSearch)
            this.focus();

        // if not resetting the selection
        if (this.state.selected.length > 0) {
            // in single mode, always close after select
            // in multiple mode, close popup when
            // - change was detected AND
            // - closeOnSelect is set to true
            if (!this.state.multiple || this.state.settings.closeOnSelect) {
                this._onHide(false, true);
            }
        }
    }

    // handler when internal model changes
    private _onModelChange() {
        // update selection text
        this.selectionText = this.state.getSelectionText() || this.placeholder;

        // get current model
        let model: any = this.state.getSelections();

        this.onModelChange(model);
        this.onModelTouched();

        // emit output event
        this.selectionChange.emit(model);
    }

    private _onHide(forceClose: boolean = false, setFocus: boolean = false) {

        if (this.isVisible) {
            // if not forcing close and animation is enabled
            if (this.state.settings.animation && !forceClose) {
                // send event to start the collapse animation
                this.state.notifyChange({source: 'input', eventName: 'collapsePopup'});
            }
            else {
                // close the popup
                this._closePopup();
            }
        }
        this.hasFocus = (true === setFocus);
        if (true === setFocus) {
            this.focus();
        }
    }

    //
    // DROPDOWN
    //

    private _initMatches() {
        if ((this.state.query && this.state.query.length > 0)
            || !this.state.hasMatches())
            this.state.generateMatches();
    }

    private _openPopup() {

        this.isVisible = true;
        this.hasFocus = true;

        this._reset();

        // prepare matched options before open popup
        this._initMatches();

        // dynamically create popup container component
        const factory = this._resolver.resolveComponentFactory(UiSelectPopupComponent);
        this._popup = factory.create(this._defaultInjector);

        const instance: any = this._popup.instance;
        instance.state = this.state;
        instance.parentElement = this._element.nativeElement;

        if (this.state.settings.bodyContainer) {
            this._applicationRef.attachView(this._popup.hostView);
            // attach the container to the body
            document.body.appendChild(this._popup.location.nativeElement);
        }
        else {
            this._viewContainer.insert(this._popup.hostView);
        }
    }

    private _closePopup() {

        this.isVisible = false;
        if (this._popup) {
            this._applicationRef.detachView(this._popup.hostView);
            this._popup.destroy();
            this._popup = null;
        }
        this._reset();
    }

    private _reset() {
        // reset the placement
        if (this.state.settings.placement) {
            this.state.placement = this.state.settings.placement;
            this.state.isDropdown = this.state.settings.placement.indexOf('bottom') >= 0
                                    || this.state.settings.placement.indexOf('top') === -1;
        }
    }
}