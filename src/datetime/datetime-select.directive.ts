import {
    AfterContentInit,
    ApplicationRef,
    ComponentFactoryResolver,
    ComponentRef,
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Injector,
    Input, OnChanges, OnDestroy,
    OnInit,
    Optional,
    Output,
    ViewContainerRef
} from '@angular/core';
import { FormControl, NgControl, NgModel } from '@angular/forms';
import { Observable, Subscription } from 'rxjs/Rx';
import 'rxjs/add/observable/fromEvent';
import { Moment, utc } from 'moment';
import { DateUtils, DEFAULT_DATETIME_FORMAT, ParserFunction } from './selectors/common/date-utils';
import { DateDisplayMode, DateTimeSelectorType, IDateTimeSettings } from './selectors/common/datetime.interface';
import { IDateSelectEvent, UiDateTimeState } from './selectors/common/datetime.state';
import { UiDateTimeSelectComponent } from './datetime-select.component';
import { DomUtils, isNotControlKey, Key } from '../common/utils';

@Directive({
    selector: '[uiDateTimeSelect]',
    exportAs: 'uiDateTimeSelect',
    providers: [
        UiDateTimeState
    ],
    host: {
        '[attr.disabled]': 'enabled ? null : true',
        '[class.is-focused]': 'hasFocus',
        '[class.is-disabled]': '!enabled',
        // '(focus)': 'onFocus()',
        // '(focusout)': 'onBlur()'
    },
})
export class UiDateTimeSelectDirective implements OnInit, AfterContentInit, OnChanges, OnDestroy {
    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _isVisible: boolean = false;         // indicates that whether popup is opened
    private _subscriptions: Subscription[] = []; // subscriptions that listening to events
    private _popup: ComponentRef<UiDateTimeSelectComponent>;
    private _parserFunction: ParserFunction;
    private _selectedDate: Moment;
    private _enabled: boolean = true;
    private _triggerElements: HTMLElement[] = [];

    protected hasFocus: boolean = false;
    protected dateSelectorEnabled: boolean = true;
    protected timeSelectorEnabled: boolean = false;

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input('enabled')
    set enabled(value: boolean) {
        this._enabled = value;
        if (!value)
            this._closePopup(false);
    }

    get enabled(): boolean {
        return this._enabled;
    }

    @Input('settings')
    set settings(value: IDateTimeSettings) {
        this.state.setSettings(value);
    }

    @Input('selectorType')
    public selectorType: DateTimeSelectorType = 'datetime';

    @Input('displayMode')
    public displayMode: DateDisplayMode = 'day';

    /** fired on every key event and returns true in case of matches are not detected */
    @Output('dateTimeChange')
    dateTimeChange: EventEmitter<Moment> = new EventEmitter();

    // check if use clicks outside of input and popup
    @HostListener('document:click', ['$event', '$event.target'])
    onClickOutside($event, target: HTMLElement) {
        if (this._element.nativeElement.contains(target)
            /*|| this._element.nativeElement.contains === target*/) {

            if (this.state.settings.supportKeyboard) {
                if (!this._isVisible)
                    this.showSelector(true);
            }
            else {
                this.toggleSelector(/*$event*/);
            }
            this.hasFocus = true;
            return;
        }

        // would not bother if popup is not opened
        if (!this._isVisible) {
            this.hasFocus = false;
            return;
        }

        // find if the click event is targeted to this component or the popup container component
        if (this._isClickOutside(target)) {

            if (this._popup || this._isVisible)
                this.hideSelector();
            this.hasFocus = false;
            return;
        }
    }

    @HostListener('focus', ['$event'])
    onFocus($event) {
        this.hasFocus = true;
    }

    @HostListener('blur', ['$event'])
    onBlur($event) {
        if (!this._isVisible)
            this.hasFocus = false;
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(@Optional() private _control: NgControl,
                @Optional() private _model: NgModel,
                private _element: ElementRef,
                private _viewContainer: ViewContainerRef,
                private _resolver: ComponentFactoryResolver,
                private _applicationRef: ApplicationRef,
                private _defaultInjector: Injector,
                protected state: UiDateTimeState) {
        // disable browser autocomplete
        if (this._element){
            DomUtils.turnOffAutocomplete(this._element.nativeElement);
        }
        this.state.popup = true;
    }

    // -------------------------------------------------------------------------
    // Lifecycle callbacks
    // -------------------------------------------------------------------------

    // implements OnInit
    ngOnInit(): void {
        this._parserFunction = DateUtils.parserFabric(this.selectorType, this.currentFormat);

        this._subscriptions.push(this._listenToModelChange());
        this._subscriptions.push(this._listenToDateChange());
        this._subscriptions.push(this._listenToInputKey());
        this._subscriptions.push(this._listenToNavKey());
    }

    // implements AfterContentInit
    ngAfterContentInit() {
        if (this._control && !!this._control.value && this._control.value.length>0) {
            this._onModelChange(<string>this._control.value);
        }
        else if (this._model && this._model.toString().length > 0) {
            this._onModelChange(this._model.toString());
        }
    }

    // implements OnChanges
    ngOnChanges(changes: any) {
        if (changes.selectorType && changes.selectorType.currentValue) {
            this.dateSelectorEnabled = this.selectorType.indexOf('date') >= 0;
            this.timeSelectorEnabled = this.selectorType.indexOf('time') >= 0;
            // recreate parse function if selector type has changed
            this._parserFunction = DateUtils.parserFabric(this.selectorType, this.currentFormat)
        }
    }

    // implements OnDestroy
    ngOnDestroy() {
        this.state.onDestroy();
        // unsubscribe all subscriptions
        this._subscriptions.forEach(sub => sub.unsubscribe());
        this._subscriptions.length = 0;
        this._triggerElements.length = 0;
    }

    // -------------------------------------------------------------------------
    // Public Methods (Public API)
    // -------------------------------------------------------------------------

    toggleSelector($event?: any): void {
        this._addTrigger($event);
        this._isVisible
            ? this.hideSelector(true)   // hide popup
            : this.showSelector(true);  // show the popup
    }

    showSelector(setFocus: boolean = false, $event?: any): void {
        this._addTrigger($event);
        // open the popup
        this._openPopup(setFocus);
    }

    hideSelector(setFocus: boolean = false, $event?: any): void {
        this._addTrigger($event);
        // close the popup
        // setFocus: true (set focus after closing popup)
        if (this._isVisible)
            this._closePopup(setFocus);
    }

    isOpened(): boolean {
        return this._isVisible;
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private _addTrigger($event?: any): void {
        if (!$event || !$event.target)
            return;

        let triggerEl: HTMLElement = $event.target;
        if (this._triggerElements.indexOf(triggerEl) === -1) {
            this._triggerElements.push(triggerEl);
        }
    }

    private _isClickOutside(target: HTMLElement): boolean {
        if (this._element.nativeElement.contains(target) ||
            this._popup && this._popup.location.nativeElement.contains(target))
            return false;

        if (this._triggerElements && this._triggerElements.length > 0) {
            let contains: boolean =
                this._triggerElements.some((element: HTMLElement) => {
                    return element && element.contains(target);
                })
            return !contains;
        }

        return true;
    }

    // Since this is a directive, model can be changed/updated by other directives/components
    // Listening to external model change and refresh internal state
    private _listenToModelChange() {
        if (this._model) {
            return this._model.valueChanges.subscribe((newValue) => {
                this._onModelChange(newValue);
            });
        }
        else if (this._control) {
            return (this._control.control as FormControl).valueChanges.subscribe((newValue) => {
                this._onModelChange(newValue);
            });
        }
        return null;
    }

    private _listenToDateChange(): Subscription {
        return this.state.dateChange$
            .subscribe((event: IDateSelectEvent) => {

                // close selector popup and set focus
                if (event.eventName === 'closePopup') {
                    this.hideSelector(event.setFocus);
                }
                else if (event.eventName === 'switchMode' && true === event.setFocus) {
                    this._element.nativeElement.focus();
                }
                else if (event.eventName === 'minDate') {
                    let minDate: Moment = event.date;
                    if (minDate) {
                        if (this.timeSelectorEnabled && this._selectedDate && minDate.isAfter(this._selectedDate, 'minute')) {
                            this._updateDateModel(minDate);
                        }
                        else if (this.dateSelectorEnabled && this._selectedDate && minDate.isAfter(this._selectedDate, 'day')) {
                            this._updateDateModel(minDate.startOf('day'));
                        }
                    }
                }
                else if (event.eventName === 'maxDate') {
                    let maxDate: Moment = event.date;
                    if (maxDate) {
                        if (this.timeSelectorEnabled && this._selectedDate && maxDate.isBefore(this._selectedDate, 'minute')) {
                            this._updateDateModel(maxDate);
                        }
                        else if (this.dateSelectorEnabled && this._selectedDate && maxDate.isBefore(this._selectedDate, 'day')) {
                            this._updateDateModel(maxDate.startOf('day'));
                        }
                    }
                }
            });
    }

    private _openPopup(setFocus: boolean = false) {
        if (!this._enabled)
            return;

        this._isVisible = true;
        this.hasFocus = true;

        // dynamically create popup container component
        const factory = this._resolver.resolveComponentFactory(UiDateTimeSelectComponent);
        this._popup = factory.create(this._defaultInjector);
        const instance: any = this._popup.instance;

        if (!instance.state) {
            instance.state = this.state;
        }
        // copy data and configurations
        instance.parentElement = this._element.nativeElement;
        instance.popup = true;
        instance.selectorType = this.selectorType;
        instance.displayMode = this.displayMode;
        instance.writeValue(this._selectedDate);
        instance.registerOnChange((value: any) => this._updateDateModel(value));

        if (this.state.settings.bodyContainer) {
            this._applicationRef.attachView(this._popup.hostView);
            // attach the container to the body
            document.body.appendChild(this._popup.location.nativeElement);
        }
        else {
            if (this._viewContainer.length > 1) {
                let index: number = DomUtils.getElementIndex(this._element.nativeElement);
                if (this._element.nativeElement.getAttribute('uiReset') !== undefined ||
                    this._element.nativeElement.getAttribute('uireset')!== undefined ) {
                    index = null;
                }
                else {
                    ++index
                }
                // create embedded view right next to input
                this._viewContainer.insert(this._popup.hostView, index);
            }
            else {
                // create embedded view right next to input
                this._viewContainer.insert(this._popup.hostView);
            }
        }
        if (true === setFocus) {
            this._element.nativeElement.focus();
        }
    }

    private _closePopup(setFocus: boolean = false) {
        this._isVisible = false;
        if (this._popup) {
            this._applicationRef.detachView(this._popup.hostView);
            this._popup.destroy();
            this._popup = null;
        }
        this.hasFocus = (true === setFocus);
        if (true === setFocus) {
            this._element.nativeElement.focus();
        }
    }

    /*
    Handle date model change from selector
     */
    private _updateDateModel(newDate: Moment): void {
        this._selectedDate = newDate ? newDate.clone() : null;
        const formattedDate: string = this._getFormattedDate(newDate);
        if (this._control) {
            this._control.viewToModelUpdate(formattedDate);
            (this._control.control as FormControl).setValue(formattedDate);
        }
        else if (this._model) {
            this._model.viewToModelUpdate(formattedDate);
        }
        // emit that the date time has changed
        this.dateTimeChange.emit(newDate);
    }

    /*
     Handle model change outside of this directive
     For example,
     - model is preset before directive initializes
     - model is reset to blank
     - model is set to different value
     The function will parse date text value into Moment object
     and set as state's current value
     **/
    private _onModelChange(newValue: string) {
        // if the value is reset by other directives
        if (!newValue || newValue.length==0) {
            if (this._selectedDate) {
                this._selectedDate = null;
                this.dateTimeChange.emit(null);
            }
            return;
        }
        const newDate: Moment = this._parserFunction(newValue, DateUtils.local);

        // if failed to parse new date string
        if (!newDate || !newDate.isValid()) {
            // reset currently selected date
            if (this._selectedDate) {
                this._selectedDate = null;
                this.dateTimeChange.emit(null);
                // if the popup is open, update it with the newly entered date
                if (this._isVisible) {
                    this.state.dateChangeSource.next({
                        eventName: 'newDate',
                        date: null
                    });
                }
            }
            return;
        }
        let selectedDate: Moment = newDate;
        if (newDate.isValid()) {
            selectedDate = newDate;//this._convertDateTimeUTC(newDate);

            if (!this._selectedDate || !this._selectedDate.isSame(selectedDate)) {
                this._selectedDate = selectedDate;
                this.dateTimeChange.emit(selectedDate);

                // if the popup is open, update it with the newly entered date
                if (this._isVisible) {
                    this.state.dateChangeSource.next({
                        eventName: 'newDate',
                        date: selectedDate
                    });
                }
            }
        }
    }

    /**
     * Formats input value based on current input type.
     * Value converted to local before formatting.
     */
    private _getFormattedDate(value: Moment): string {
        if (!value || !value.isValid()) {
            return '';
        }

        const mode: DateTimeSelectorType = this.selectorType || 'date';
        if (mode === 'date') {
            return value.clone().format(this.currentFormat);
        }

        return value.clone().local().format(this.currentFormat);
    }

    /** Format based on date picker current type. */
    private get currentFormat(): string {
        return this.state.settings.format || DEFAULT_DATETIME_FORMAT[this.selectorType || 'date'];
    }

    private _convertDateTimeUTC(value: Moment): Moment {
        if (!value || !value.isValid()) {
            return value;
        }

        const mode: DateTimeSelectorType = this.selectorType || 'date';
        if (mode === 'date') {
            return utc({year: value.year(), month: value.month(), date: value.date()});
        } else {
            return value.clone().utc();
        }
    }

    // Listening to input key and format automatically
    private _listenToInputKey(): Subscription {

        if (!this.state.settings.autofill)
            return null;

        let separator = DateUtils.getDateFormatSeparator(this.state.settings.format);
        let formatParts: Array<string> = this.state.settings.format.split(separator);

        const endsWith = (val: string, suffix: string): boolean => {
            return val.indexOf(suffix, val.length - suffix.length) !== -1;
        };

        const insertPos = (str: string, idx: number, val: string): string => {
            return str.substr(0, idx) + val + str.substr(idx);
        };

        const getPartLength = (idx: number): number => {
            return formatParts[idx].length;
        };

        const isNumber = (val: string): boolean => {
            return val.match(/[1-9]/) !== null;
        };

        const isDay = (idx: number): boolean => {
            return formatParts[idx].indexOf("D") !== -1;
        };

        const isMonth = (idx: number): boolean => {
            return formatParts[idx].indexOf("M") !== -1
                && formatParts[idx].length === 2;
        };

        const setInputValue = (val: string): void => {
            this._element.nativeElement.value = val;
        };

        const getInputValue = (): string => {
            return this._element.nativeElement.value
        };

        return Observable.fromEvent(this._element.nativeElement, 'keyup')
            .filter((event: KeyboardEvent) => isNotControlKey(event.keyCode))
            .subscribe((event: KeyboardEvent) => {

                // event.stopPropagation();
                // event.preventDefault();

                let val: string = getInputValue();
                let ews: boolean = endsWith(val, separator);
                let parts: Array<string> = val.split(separator);
                let idx: number = parts.length - 1;

                if (val.indexOf(separator + separator) !== -1) {
                    return;
                }

                if (!ews && (val.length === getPartLength(0)
                            || val.length === getPartLength(0) + getPartLength(1) + separator.length)) {
                    setInputValue(val + separator);
                }
                else if (ews && parts[idx - 1].length < getPartLength(idx - 1)
                                && isNumber(parts[idx - 1])
                                && (isDay(idx - 1) || isMonth(idx - 1))) {
                    setInputValue(insertPos(val, val.length - 2, "0"));
                }
                else if (parts[idx].length < getPartLength(idx)
                        && isNumber(parts[idx])
                        && (Number(parts[idx]) > 3 && isDay(idx)
                         || Number(parts[idx]) > 1 && isMonth(idx))) {
                    setInputValue(insertPos(val, val.length - 1, "0") + (idx < 2 ? separator : ""));
                }
            });
    }

    private _listenToNavKey(): Subscription {
        return Observable.fromEvent(this._element.nativeElement, 'keydown')
            .subscribe((event: KeyboardEvent) => {
                switch (event.keyCode) {
                    case Key.ArrowUp:
                    case Key.ArrowDown:
                        if (!this.state.settings.supportKeyboard)
                            return;

                        event.stopPropagation();
                        event.preventDefault();
                        if (!this._isVisible) {
                            this.showSelector(true);
                        }
                        else {
                            this.state.dateChangeSource.next({
                                eventName: event.keyCode === Key.ArrowUp
                                    ? 'navigateUp'
                                    : 'navigateDown'});
                        }

                        break;

                    case Key.ArrowLeft:
                    case Key.ArrowRight:
                        if (!this.state.settings.supportKeyboard)
                            return;

                        if (this._isVisible) {
                            event.stopPropagation();
                            event.preventDefault();
                            this.state.dateChangeSource.next({
                                eventName: event.keyCode === Key.ArrowLeft
                                    ? 'navigateLeft'
                                    : 'navigateRight'});
                        }
                        break;

                    case Key.Enter:
                        if (!this.state.settings.supportKeyboard)
                            return;

                        if (this._isVisible) {
                            event.stopPropagation();
                            event.preventDefault();
                            this.state.dateChangeSource.next({eventName: 'selectActive'});
                        }
                        break;

                    case Key.Escape:
                        if (this._isVisible) {
                            event.stopPropagation();
                            event.preventDefault();
                            this.hideSelector(true);
                        }
                        break;

                    case Key.Tab:
                        if (this._isVisible) {
                            this.hideSelector();
                        }
                        break;
                }
            });
    }
}
