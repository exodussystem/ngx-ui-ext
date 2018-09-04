import { Component } from '@angular/core';
import { Moment, utc } from 'moment';
import { DateUtils } from '../common/date-utils';
import { AbstractSelectorComponent } from '../common/abstract-select.component';
import { UiDateTimeState } from '../common/datetime.state';
import { IDate } from '../common/datetime.interface';

@Component({
    selector: 'ui-day-selector',
    template: `
        <div class="ui-datetime-container">
            <ui-period-switch [period]="date?.format('MMMM YYYY')"
                              [enabled]="enabled"
                              [prevEnabled]="isPrevEnabled"
                              [nextEnabled]="isNextEnabled"
                              [displayMode]="'month'"
                              (prev)="previousPeriod()"
                              (next)="nextPeriod()"
                              (periodChange)="switchMode($event)">
            </ui-period-switch>
            <ul class="days-of-week" [class.disabled]="!enabled">
                <li *ngFor="let dow of daysOfWeek" class="day-of-week">
                    {{dow}}
                </li>
            </ul>
            <ul class="days-of-month ui-datetime-dates">
                <li *ngFor="let dateElement of dateListing; let index = index;" class="day-of-month ui-datetime-date" 
                    (mousedown)="selectDate($event, dateElement, index)"
                    [ngClass]="{
                      'selected': dateElement.selected,
                      'active': dateElement.active,
                      'today': state.settings.highlightToday && isToday(dateElement.date),
                      'disabled': !enabled || dateElement.disabled
                    }">
                    {{dateElement.text}}
                </li>
            </ul>
        </div>`
})
export class UiDaySelectorComponent extends AbstractSelectorComponent {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    protected today: Moment = DateUtils.local();
    protected daysOfWeek: string[];

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(state: UiDateTimeState) {
        super(state, 'day');
        this.stepsPerRow = 7;
        this.stepsPerCol = 1;
        this.perdiodIncrement = 1;

        // Gets array of localized days of week.
        this.daysOfWeek = [];
        for (let weekday = 0; weekday < 7; weekday++) {
            this.daysOfWeek.push(utc().weekday(weekday).format('dd'));
        }
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    isToday(date: Moment): boolean {
        return this.isSame(date, this.today);
    }
    //
    // isCurrentMonth(date: Moment): boolean {
    //     return date
    //         && this.value.year() === date.year()
    //         && this.value.month() === date.month();
    // }

    sameMonth(date1: Moment, date2: Moment): boolean {
        return date1 && date2
            && date1.year() === date2.year()
            && date1.month() === date2.month();
    }

    // Override super method
    generateDateListing(): IDate[] {

        /**
         * Array of days belongs to the month of the specified date
         * including previous and next month days
         * which are on the same week as first and last month days.
         */

        this.start = this.value.clone().startOf('month').startOf('week').startOf('day');
        this.end = this.value.clone().endOf('month').endOf('week').startOf('day');

        let setSelected: boolean = !this.sameMonth(this.selectedDate, this.value);

        const dateElements: IDate[] = [];
        let current: Moment = this.start.clone().weekday(0).subtract(1, 'd');
        let index: number = 0;
        do {
            current = current.clone().add(1, 'd');
            let dateElement: IDate = {
                mode: this.displayMode,
                date: current,
                text: current.format('D'),
                selected: false,
                active: false,
                disabled: false
            };
            // set 'disabled' attribute
            if (!this.isSelectable(current)) {
                dateElement.disabled = true;
            }
            // set 'selected' attribute
            if (!setSelected && this.isSame(this.selectedDate, current)) {
                dateElement.selected = true;
                setSelected = true;
                if (this.focusIndex === -3) {
                    this.focusIndex = index;
                }
            }
            dateElements.push(dateElement);
            index++;

        } while (current.isBefore(this.end))

        return dateElements;
    }

    //Override super method
    isSelectable(date: Moment): boolean {
        return super.isSelectable(date) && this.sameMonth(date, this.value);
    }
}
