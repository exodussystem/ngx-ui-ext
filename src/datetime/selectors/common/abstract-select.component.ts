import { EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { DurationInputArg1, DurationInputArg2, Moment, unitOfTime } from 'moment';
import { DateUtils } from './date-utils';
import { Subscription } from 'rxjs/Subscription';
import { IDateSelectEvent, UiDateTimeState } from './datetime.state';
import { IDate } from './datetime.interface';

export abstract class AbstractSelectorComponent implements OnInit, OnDestroy, OnChanges {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    public DISPLAY_MODES: Array<string> = ['year', 'month', 'day', 'hour', 'minute'];

    protected isPrevEnabled: boolean = true;
    protected isNextEnabled: boolean = true;
    protected displayMode: string;      // current display mode that the subclass implements
    protected state: UiDateTimeState;   // current state
    protected precision: string;        // the precision used to compare two dates
    protected perdiod: string;          // the period that navigation buttons will change
    protected perdiodIncrement: number; // the increment that the navigation buttons will add/subtract
    protected stepsPerRow: number = 3;  // periods to skip per row. Used to calculate new date when Up/Down is pressed
    protected stepsPerCol: number = 1;  // periods to skip per col. Used to calculate new date when Up/Down is pressed
    protected start: Moment;            // beginning date of current view
    protected end: Moment;              // end date of current view
    protected focusIndex: number = -3;  // -3 unknown/ -2 max / -1 min / 0..
    protected dateListing: IDate[];

    private _subscriptions: Subscription[] = []; // subscriptions that listening to events

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input('enabled')
    public enabled: boolean = true;

    @Input("date")
    protected date: Moment;

    @Input("selected")
    protected selectedDate: Moment;     // currently selected date

    @Input("active")
    protected isActive: boolean = false;

    @Output()
    public periodChange: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    public dateSelected: EventEmitter<Moment> = new EventEmitter<Moment>();

    @Output()
    public dateChange: EventEmitter<Moment> = new EventEmitter<Moment>();
    // if use [(date)}="" as Input then Output should be 'dateChange'

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(state?: UiDateTimeState, displayMode?: string) {
        this.displayMode = displayMode;
        this.state = state;

        if (displayMode) {
            if (displayMode === 'decade' || displayMode === 'century') {
                this.precision = 'year';
                this.perdiod = 'year';
            }
            else {
                this.perdiod = this._getPeriod(displayMode);
                this.precision = displayMode;
            }
        }
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    set value(val: Moment) {
        this.dateChange.emit(val ? val.clone() : null);
    }

    // Returns cloned not-null selected value.
    get value(): Moment {
        return (this.date || DateUtils.local()).clone();
    }

    selectDate($event: any, item: IDate, index?: number) {
        if ($event) {
            $event.preventDefault();
            $event.stopPropagation();
        }
        if (!this.enabled || item.disabled)
            return;

        if (item.date && this.state.settings.supportKeyboard) {
            if (this.focusIndex >= 0 && this.focusIndex <= this.dateListing.length-1) {
                this.dateListing[this.focusIndex].active = false;
            }
            this.focusIndex = index;
            if (this.focusIndex >= 0 && this.focusIndex <= this.dateListing.length-1) {
                this.dateListing[this.focusIndex].active = true;
            }
        }
        let newDate: Moment = item.date;
        if (this.displayMode === 'hour' || this.displayMode === 'minute') {
            this.value = newDate.clone();
        }
        else {
            this.dateSelected.emit(newDate.clone());
        }
    }

    previousPeriod(increment?: number, precision?: string): void {
        let arg1 = <DurationInputArg1>(increment || this.perdiodIncrement);
        let arg2 = <DurationInputArg2>(precision || this.perdiod);
        this.value = this.value.subtract(arg1, arg2);
    }

    nextPeriod(increment?: number, precision?: string): void {
        let arg1 = <DurationInputArg1>(increment || this.perdiodIncrement);
        let arg2 = <DurationInputArg2>(precision || this.perdiod);
        this.value = this.value.add(arg1, arg2);
    }

    formatDecade(value: Moment): string {
        const [start, end] = DateUtils.decade(value);
        return `${start.format("YYYY")}-${end.format("YYYY")}`;
    }

    switchMode($event) {
        this.periodChange.emit($event)
        this.state.dateChangeSource.next({eventName: 'switchMode', setFocus: this.state.settings.supportKeyboard});
    }

    isSame(date1: Moment, date2: Moment): boolean {
        return date1 && date2 && date1.isSame(date2, <moment.unitOfTime.StartOf>this.precision);
    }

    isBefore(date1: Moment, date2: Moment): boolean {
        return date1 && date2 && date1.isBefore(date2, <moment.unitOfTime.StartOf>this.precision);
    }

    isAfter(date1: Moment, date2: Moment): boolean {
        return date1 && date2 && date1.isAfter(date2, <moment.unitOfTime.StartOf>this.precision);
    }

    isSelectable(date: Moment): boolean {
        if (this.state.minDate && this.isBefore(date, this.state.minDate)) {
            return false;
        }
        if (this.state.maxDate && this.isAfter(date, this.state.maxDate)) {
            return false;
        }
        return true;
    }

    // -------------------------------------------------------------------------
    // Lifecycle callbacks
    // -------------------------------------------------------------------------

    // implements OnInit
    ngOnInit(): void {
        if (this.precision !== 'second') {

            this.state.dateChange$.subscribe((event: IDateSelectEvent) => {

                if (event.eventName === 'minDate' ||
                    event.eventName === 'maxDate') {
                    this.refreshView(event.date || this.date);
                    return
                }

                if (!this.state.settings.supportKeyboard || !this.isActive)
                    return;

                if (event.eventName === 'navigateUp') {
                    this._updateFocus(-1 * this.stepsPerRow);
                }
                else if (event.eventName === 'navigateDown') {
                    this._updateFocus(this.stepsPerRow);
                }
                else if (event.eventName === 'navigateLeft') {
                    this._updateFocus(-1 * this.stepsPerCol);
                }
                else if (event.eventName === 'navigateRight') {
                    this._updateFocus(this.stepsPerCol);
                }
                else if (event.eventName === 'selectActive') {
                    // select currently focus date
                    if (this.focusIndex >= 0 && this.focusIndex <= this.dateListing.length-1) {
                        this.selectDate(null, this.dateListing[this.focusIndex], this.focusIndex);
                    }
                }
            });
        }
    }

    // implements OnChanges
    ngOnChanges(changes: any) {
        if (changes.isActive && changes.isActive.currentValue === true) {
            this.isPrevEnabled = this.enablePrevious(this.value);
            this.isNextEnabled = this.enableNext(this.value);
        }
        if (changes.date && changes.date.currentValue) {
            let newDate: Moment = changes.date.currentValue;
            this.refreshView(newDate);
        }
    }

    // implements OnDestroy
    ngOnDestroy() {
        // unsubscribe all subscriptions
        this._subscriptions.forEach(sub => sub.unsubscribe());
        this._subscriptions.length = 0;
    }

    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------

    protected generateDateListing(): IDate[] {
        // subclass must override this method to provide list of dates (days/months/years...)
        return [];
    }

    protected regenerateListing(date: Moment) {
        if (this.precision !== 'second' && date) {
            this.date = date;
            this.dateListing = this.generateDateListing();

            // update focus index
            if (this.state.settings.supportKeyboard) {
                if (this.focusIndex === -1) {
                    this.focusIndex = 0;
                }
                else if (this.focusIndex === -2) {
                    this.focusIndex = this.dateListing.length - 1;
                }
                if (this.focusIndex >=0
                    && this.focusIndex <= this.dateListing.length-1) {
                    this.dateListing[this.focusIndex].active = true;
                }
            }
        }
    }

    protected refreshView(newDate: Moment) {
        this.focusIndex = -3;
        this.regenerateListing(newDate);
        // update previous and next control button when
        // the view is activated or
        // selected date has changed or
        // either minDate or maxDate has changed
        this.isPrevEnabled = this.enablePrevious(this.value);
        this.isNextEnabled = this.enableNext(this.value);
    }

    protected enablePrevious(date: Moment, increment?: number, precision?: string): boolean {
        if (this.state.minDate && date) {
            let arg1 = <DurationInputArg1>(increment || this.perdiodIncrement);
            let arg2 = <DurationInputArg2>(precision || this.perdiod);

            let newDate: Moment = date.subtract(arg1, arg2);
            return this.state.minDate.isSameOrBefore(newDate, arg2);
        }

        return true;
    }

    protected enableNext(date: Moment, increment?: number, precision?: string): boolean {
        if (this.state.maxDate && date) {
            let arg1 = <DurationInputArg1>(increment || this.perdiodIncrement);
            let arg2 = <DurationInputArg2>(precision || this.perdiod);

            let newDate: Moment = date.add(arg1, arg2);
            return this.state.maxDate.isSameOrAfter(newDate, arg2);
        }
        return true;
    }

    protected findElement(date: Moment): IDate {
        return this.dateListing
            ? this.dateListing.find((dateElememt: IDate) => this.isSame(dateElememt.date, date))
            : null;
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private _updateFocus(direction: number) {
        let newIndex: number = this.focusIndex;
        if (this.focusIndex >= 0) {
            newIndex += direction;
        }
        else {
            newIndex = 0;
        }

        // if focus is going off current view (to the left)
        if (newIndex < 0) {
            // make sure that not navigating pass minDate
            if (this.isPrevEnabled) {
                this.focusIndex = -2;   // max
                this.previousPeriod();
            }
            return;
        }
        // if focus is going off current view (to the right)
        if (newIndex > this.dateListing.length-1) {
            // make sure that not navigating pass maxDate
            if (this.isNextEnabled) {
                this.focusIndex = -1;   // min
                this.nextPeriod();
            }
            return;
        }
        // otherwise, update the focus

        if (this.focusIndex >= 0 && this.focusIndex <= this.dateListing.length-1) {
            this.dateListing[this.focusIndex].active = false;
        }
        this.focusIndex = newIndex;
        if (this.focusIndex >= 0 && this.focusIndex <= this.dateListing.length-1) {
            this.dateListing[this.focusIndex].active = true;
        }
    }

    private _getPeriod(displayMode: string): string {
        let index: number = this.DISPLAY_MODES.indexOf(displayMode);
        if (index > 0 && index < this.DISPLAY_MODES.length) {
            return this.DISPLAY_MODES[index - 1];
        }
        return displayMode;
    }
}