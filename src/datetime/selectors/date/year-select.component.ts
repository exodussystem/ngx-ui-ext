import { Component, ElementRef } from '@angular/core';
import { Moment } from 'moment';
import { DateUtils } from '../common/date-utils';
import { AbstractSelectorComponent } from '../common/abstract-select.component';
import { UiDateTimeState } from '../common/datetime.state';
import { IDate } from '../common/datetime.interface';

@Component({
    selector: 'ui-year-selector',
    template: `
        <div class="ui-datetime-container">
            <ui-period-switch [period]="formatDecade(date)"
                              [enabled]="enabled"
                              [prevEnabled]="isPrevEnabled"
                              [nextEnabled]="isNextEnabled"
                              [displayMode]="'decade'"
                              (prev)="previousPeriod()"
                              (next)="nextPeriod()"
                              (periodChange)="switchMode($event)">
            </ui-period-switch>
            <ul class="years-of-decade ui-datetime-dates">
                <li *ngFor="let dateElement of dateListing; let index = index;" class="year-of-decade  ui-datetime-date"
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
export class UiYearSelectorComponent extends AbstractSelectorComponent {

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(state: UiDateTimeState) {
        super(state, 'year');
        this.stepsPerRow = 3;
        this.stepsPerCol = 1;
        this.perdiodIncrement = 10;
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    // Override super method
    generateDateListing(): IDate[] {
        const [start, end] = DateUtils.decade(this.value);
        this.start = start.clone().subtract(1, 'year');
        this.end = end.clone().add(1, 'year');

        let setSelected: boolean = false;
        const dateElements: IDate[] = [];
        for (let year = 0; year < 12; year++) {
            let current: Moment = this.start.clone().add(year, 'year');
            let dateElement: IDate = {
                mode: this.displayMode,
                text: current.format('YYYY'),
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
    isSelectable(date: Moment): boolean {
        return super.isSelectable(date)
            && date.year() !== this.start.year()
            && date.year() !== this.end.year();
    }
}
