import {
    AfterContentInit,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { Moment } from 'moment';
import { Subscription } from 'rxjs/Subscription';
import { PositionService } from '../common/service';
import { ValueAccessorProviderFactory } from '../common/utils/provider-utils';
import { IDateSelectEvent, UiDateTimeState } from './selectors/common/datetime.state';
import { DateUtils } from './selectors/common/date-utils';
import { DateDisplayMode, DateTimeSelectorType, IDateTimeSettings } from './selectors/common/datetime.interface';

@Component({
    selector: "ui-datetime-select",
    providers: [ValueAccessorProviderFactory(UiDateTimeSelectComponent)],
    template: `
        <div class="ui-datetime-panel">
            <ui-date-selector *ngIf="dateSelectorEnabled"
                              [(ngModel)]="date"
                              [enabled]="enabled"
                              [displayMode]="displayMode">
            </ui-date-selector>
            <ui-time-selector *ngIf="timeSelectorEnabled"
                              [(ngModel)]="time"
                              [enabled]="enabled">
            </ui-time-selector>
        </div>
    `,
    /*
    template: `
        <div class="ui-datetime-panel" *ngIf="dateSelectorEnabled && timeSelectorEnabled && state.settings.tabMode">
            <div class="tabbable tabs-bottom">
                <div class="tab-content borderless">
                    <div class="tab-pane active" id="date">
                        <ui-date-selector *ngIf="dateSelectorEnabled"
                                          [(ngModel)]="date"
                                          [enabled]="enabled"
                                          [displayMode]="displayMode">
                        </ui-date-selector>
                    </div>
                    <div class="tab-pane" id="time">
                        <ui-time-selector *ngIf="timeSelectorEnabled"
                                          [(ngModel)]="time"
                                          [enabled]="enabled">
                        </ui-time-selector>
                    </div>
                </div>
                <ul class="nav nav-tabs">
                    <li class="active"><a href="#date" data-toggle="tab"><span uiIcon name="calendar"></span></a></li>
                    <li><a href="#time" data-toggle="tab"><span uiIcon name="time"></span></a></li>
                </ul>
            </div>
        </div>
        <div class="ui-datetime-panel" *ngIf="!(dateSelectorEnabled && timeSelectorEnabled) || !state.settings.tabMode">
            <ui-date-selector *ngIf="dateSelectorEnabled"
                              [(ngModel)]="date"
                              [enabled]="enabled"
                              [displayMode]="displayMode">
            </ui-date-selector>
            <ui-time-selector *ngIf="timeSelectorEnabled"
                              [(ngModel)]="time"
                              [enabled]="enabled">
            </ui-time-selector>
        </div>
    `,
     styles: [`
        .borderless {
            border: none !important;
        }
     `
     ],*/
    host: {
        '[style.z-index]': 'popup ? \'1010\' : \'inherit\''
    },
    encapsulation: ViewEncapsulation.None
})
export class UiDateTimeSelectComponent implements OnInit, AfterContentInit, OnDestroy, ControlValueAccessor {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    public popup: boolean = false;
    public parentElement: HTMLElement;

    protected dateSelectorEnabled: boolean = true;
    protected timeSelectorEnabled: boolean = false;

    private _dateValue: Moment;
    private _timeValue: Moment;
    private _onChange: (value: any) => void;
    private _subscriptions: Subscription[];
    private _selectorType: DateTimeSelectorType = 'date';

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input('settings')
    set settings(value: IDateTimeSettings) {
        this.state.setSettings(value);
    }

    @Input("selectorType")
    set selectorType(selectorType: DateTimeSelectorType) {
        this._selectorType = selectorType || 'date';
        this.dateSelectorEnabled = this._selectorType.indexOf('date') >= 0;
        this.timeSelectorEnabled = this._selectorType.indexOf('time') >= 0;
    }

    @Input("displayMode")
    public displayMode: DateDisplayMode = 'day';

    @Input('enabled')
    public enabled: boolean = true;

    @Output()
    public dateSelected: EventEmitter<Moment> = new EventEmitter<Moment>();

    @HostBinding('style.position')
    get position(): string {
        return (this.popup && this.state.settings.bodyContainer) ? 'absolute' : 'relative';
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private _element: ElementRef,
                private _ngZone: NgZone,
                private _posService: PositionService,
                public state: UiDateTimeState) {
    }

    // -------------------------------------------------------------------------
    // Lifecycle callbacks
    // -------------------------------------------------------------------------

    // implements OnInit
    ngOnInit(): void {
        this._subscriptions = [
            this._listenToPositionChange()
        ];
    }

    // implements AfterContentInit
    ngAfterContentInit(): void {
        if (this.popup && this.state.settings.bodyContainer) {
            this._updatePosition();
        }
        if (!this.popup) {
            this.state.dateChange$
                .filter(event => event && (
                    event.eventName === 'minDate' ||
                    event.eventName === 'maxDate' ||
                    event.eventName === 'newDate')
                )
                .subscribe((event: IDateSelectEvent) => {
                    if (event.eventName === 'minDate') {
                        let minDate: Moment = event.date;
                        if (minDate) {
                            if (this.timeSelectorEnabled
                                && this._timeValue
                                && minDate.isAfter(this._timeValue, 'minute')) {

                                this._timeValue = minDate.clone();
                                this._notifyDateChange(this._timeValue);
                            }
                            else if (this.dateSelectorEnabled
                                && this._dateValue
                                && minDate.isAfter(this._dateValue, 'day')) {

                                this._dateValue = minDate.clone().startOf('day');
                                this._notifyDateChange(this._dateValue);
                            }
                        }
                    }
                    else if (event.eventName === 'maxDate') {
                        let maxDate: Moment = event.date;
                        if (maxDate) {
                            if (this.timeSelectorEnabled
                                && this._timeValue
                                && maxDate.isBefore(this._timeValue, 'minute')) {

                                this._timeValue = maxDate.clone();
                                this._notifyDateChange(this._timeValue);
                            }
                            else if (this.dateSelectorEnabled
                                && this._dateValue
                                && maxDate.isBefore(this._dateValue, 'day')) {

                                this._dateValue = maxDate.clone().startOf('day');
                                this._notifyDateChange(this._dateValue);
                            }
                        }
                    }
                    else if (event.eventName === 'newDate') {
                        this.writeValue(event.date);
                        return;
                    }
                });
        }
    }

    // implements OnDestroy
    ngOnDestroy(): void {
        this.state = null;
        // release all object references
        this.parentElement = null;
        // unsubscribe
        this._subscriptions.forEach(sub => sub && sub.unsubscribe());
        this._subscriptions.length = 0;
    }

    //
    // implements ControlValueAccessor
    //

    writeValue(value: any): void {
        let parsedValue: Moment;
        if (value && value.isMoment) {
            parsedValue = <Moment>value;
        }
        else
        {
            if (this.state && this.state.settings && this.state.settings.format) {
                parsedValue = DateUtils.local(value, this.state.settings.format);
            }
            else {
                parsedValue = DateUtils.local(value);
            }
        }

        if (parsedValue.isValid()) {
            if (this.dateSelectorEnabled) {
                this._dateValue = parsedValue.clone().startOf('day');
            }
            if (this.timeSelectorEnabled) {
                this._timeValue = parsedValue.clone();
            }
        }
    }

    registerOnChange(fn: any): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: any): void {
    }

    // -------------------------------------------------------------------------
    // Public Methods (Public API)
    // -------------------------------------------------------------------------

    get date(): Moment {
        return this._dateValue;
    }

    set date(value: Moment) {
        // if resetting date
        if (!value) {
            this._dateValue = value;
            return;
        }
        // if 'datetime' or 'time'
        if (this.timeSelectorEnabled) {

            // merge date and time
            let newDate: Moment = this._validateDate(this._mergeTimeValue(value));

            // update both date and time with the new value
            this._timeValue = newDate.clone();
            this._dateValue = newDate.clone().startOf('day');

            // validate with minDate/maxDate and send out update
            this._notifyDateChange(this._timeValue);
        }
        // if 'date' only
        else if (value && value.isValid()){

            // strip out the time component
            let newDate: Moment = this._validateDate(value);

            // update date with the new value
            this._dateValue = newDate.clone().startOf('day');

            // validate with minDate/maxDate and send out update
            this._notifyDateChange(this._dateValue);
        }
    }

    get time(): Moment {
        return this._timeValue;
    }

    set time(value: Moment) {
        this._timeValue = value;
        let newDate: Moment = this._mergeTimeValue(value);
        this._timeValue = this._validateDate(newDate);
        this._notifyDateChange(this._timeValue);
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private _mergeTimeValue(value: Moment): Moment {
        let newDate: Moment = value ? value.clone() : DateUtils.local();
        if (!this._timeValue)
            this._timeValue = DateUtils.local();

        newDate.hour(this._timeValue.hour())
                .minute(this._timeValue.minute())
                .second(this._timeValue.second())
                .millisecond(this._timeValue.millisecond());

        return newDate;
    }

    private _validateDate(newDate: Moment): Moment {

        if (this.state.minDate && this.state.minDate.isAfter(newDate)) {
            newDate = this.state.minDate.clone();
        }
        else if (this.state.maxDate && this.state.maxDate.isBefore(newDate)) {
            newDate = this.state.maxDate.clone();
        }
        return newDate;
    }

    private _notifyDateChange(newDate: Moment): void {
        if (this._onChange) {
            this._onChange(newDate);
        }
        if (!this.popup) {
            this.dateSelected.emit(newDate);
        }
    }

    // if parent element size/position has been changed
    private _listenToPositionChange(): Subscription {
        if (this.popup && this.state.settings.bodyContainer) {
            return this._ngZone.onStable.subscribe(() => {
                this._updatePosition()
            });
        }
        return null;
    }

    private _updatePosition() {
        this._posService.position({
            element: this._element.nativeElement,
            target: this.parentElement,
            attachment: this.state.settings.placement,
            appendToBody: this.state.settings.bodyContainer
        });
    }
}
