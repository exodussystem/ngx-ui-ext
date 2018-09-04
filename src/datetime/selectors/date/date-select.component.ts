import { ControlValueAccessor } from '@angular/forms';
import { ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';
import { Moment } from 'moment';
import { ValueAccessorProviderFactory, OnChangeHandler } from '../../../common/utils/provider-utils';
import { IDateSelectEvent, UiDateTimeState } from '../common/datetime.state';
import { DateUtils } from '../common/date-utils';
import { DateDisplayMode, DateSelectorMode } from '../common/datetime.interface';

@Component({
    selector: 'ui-date-selector',
    providers: [ValueAccessorProviderFactory(UiDateSelectorComponent)],
    template: `
        <div class="ui-datetime-container">
            <ui-day-selector 
                    [hidden]="mode !== 'day'"
                    [active]="mode === 'day'"
                    [enabled]="enabled"
                    [selected]="selectedDate"
                    [(date)]="displayDate"
                    (dateSelected)="onDateSelected($event)"
                    (periodChange)="mode='month'">
            </ui-day-selector>
            <ui-month-selector 
                    [hidden]="mode !== 'month'"
                    [active]="mode === 'month'"
                    [enabled]="enabled"
                    [selected]="selectedDate"
                    [(date)]="displayDate"
                    (dateSelected)="onDateSelected($event, displayMode !== 'month' ? 'day' : null)" 
                    (periodChange)="mode='year'">
            </ui-month-selector>
            <ui-year-selector 
                    [hidden]="mode !== 'year'"
                    [active]="mode === 'year'"
                    [enabled]="enabled"
                    [selected]="selectedDate"
                    [(date)]="displayDate"
                    (dateSelected)="onDateSelected($event, displayMode !== 'year' ? 'month' : null)"
                    (periodChange)=" mode='decade' ">
            </ui-year-selector>
            <ui-decade-selector 
                    [hidden]="mode !== 'decade'"
                    [active]="mode === 'decade'"
                    [enabled]="enabled"
                    [selected]="selectedDate"
                    [(date)]="displayDate"
                    (dateSelected)="onDateSelected($event, 'year')">
            </ui-decade-selector>
        </div>
    `
})
export class UiDateSelectorComponent implements OnChanges, ControlValueAccessor {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _onChange: OnChangeHandler;
    private _onTouched: Function;

    protected mode: DateSelectorMode = 'day';
    protected displayDate: Moment = DateUtils.local();
    protected selectedDate: Moment;

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input('enabled')
    public enabled: boolean = true;

    @Input("displayMode")
    public displayMode: DateDisplayMode = 'day';

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(protected state: UiDateTimeState,
                private _cdr : ChangeDetectorRef) {
    }

    // -------------------------------------------------------------------------
    // Lifecycle callbacks
    // -------------------------------------------------------------------------

    //
    // implements ControlValueAccessor
    //

    writeValue(val: any): void {
        if (val === null || val === undefined) {
            this.selectedDate = null;
        }
        else {
            let parsedValue = DateUtils.local(val);
            if (parsedValue.isValid()) {
                this.selectedDate = parsedValue;
            }
        }
        this.displayDate = this.selectedDate || DateUtils.local();
    }

    registerOnChange(fn: OnChangeHandler): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: Function): void {
        this._onTouched = fn;
    }

    // implements OnChanges
    ngOnChanges(changes: any) {
        if (changes.displayMode) {
            this.mode = this.displayMode;
        }
    }

    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------

    protected onDateSelected($event, switchToMode?: DateSelectorMode) {
        this.displayDate = $event;
        if (this.mode === this.displayMode) {
            let clone: Moment = this.displayDate.clone();

            this._onChange && this._onChange(clone);

            if (this.state.popup && this.state.settings.closeOnSelect) {
                this.state.dateChangeSource.next({eventName: 'closePopup', setFocus: true});
            }
            else {
                this.selectedDate = clone;
            }
        }
        if (switchToMode) {
            this.mode = switchToMode;
            this._cdr.detectChanges();
        }
    }
}