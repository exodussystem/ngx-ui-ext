import { Component, ElementRef } from '@angular/core';
import { Moment } from 'moment';
import { DateUtils } from '../common/date-utils';
import { AbstractSelectorComponent } from '../common/abstract-select.component';
import { UiDateTimeState } from '../common/datetime.state';
import { IDate } from '../common/datetime.interface';

@Component({
    selector: 'ui-decade-selector',
    template: `
        <div class="ui-datetime-container">
            <ui-period-switch [period]="formatCentury()"
                              [enabled]="enabled"
                              [displayMode]="'century'"
                              [prevEnabled]="isPrevEnabled"
                              [nextEnabled]="isNextEnabled"
                              (prev)="previousPeriod()"
                              (next)="nextPeriod()"
                              (periodChange)="switchMode($event)">
            </ui-period-switch>
            <ul class="decades-of-century ui-datetime-dates">
                <li *ngFor="let dateElement of dateListing; let index = index;" class="decade-of-century ui-datetime-date"
                    (mousedown)="selectDate($event, dateElement, index)"
                    [ngClass]="{
                       'selected': dateElement.selected,
                        'active': dateElement.active,
                        'disabled': !enabled || dateElement.disabled
                    }">
                    {{dateElement.text}}
                </li>
            </ul>
        </div>
    `
})
export class UiDecadeSelectorComponent extends AbstractSelectorComponent {

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(state: UiDateTimeState) {
        super(state, 'decade');
        this.stepsPerRow = 30;
        this.stepsPerCol = 10;
        this.perdiodIncrement = 100;
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    formatCentury(): string {
        const startYear = this.value.year() - this.value.year() % 100;
        const endYear = startYear + 99;

        return `${startYear}-${endYear}`;
    }

    inRange(date1: Moment, date2: Moment): boolean {
        const [start, end] = DateUtils.decade(date2);
        return date1 && date1.year() >= start.year() && date1.year() <= end.year();
    }

    // Override super method
    generateDateListing(): IDate[] {
        const startYear: number = this.value.year() - this.value.year() % 100 - 10 ;
        this.start = this.value.year(startYear);
        this.end = this.value.year(startYear + 120);

        let setSelected: boolean = false;
        const dateElements: IDate[] = [];

        for (let year = 0; year < 120; year = year + 10) {
            let current: Moment = this.start.clone().add(year, 'year');
            let dateElement: IDate = {
                mode: this.displayMode,
                text: this.formatDecade(current),
                date: current,
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
                    this.focusIndex = year;
                }
            }

            dateElements.push(dateElement);
        }
        return dateElements;
    }

    // Override super method
    isSame(date1: Moment, date2: Moment): boolean {
        return this.inRange(date1, date2)
    }

    // override super method
    isBefore(date1: Moment, date2: Moment): boolean {
        const [start, end] = DateUtils.decade(date2);
        return date1 && date1.year() < start.year();
    }

    // override super method
    isAfter(date1: Moment, date2: Moment): boolean {
        const [start, end] = DateUtils.decade(date2);
        return date1 && date1.year() > end.year();
    }

    // override super method
    isSelectable(date: Moment): boolean {
        return super.isSelectable(date)
            && date.year() >= this.start.year() + 10
            && date.year() <= this.end.year() - 11;
    }
}