import { Component } from '@angular/core';
import { Moment } from 'moment';
import { AbstractSelectorComponent } from '../common/abstract-select.component';
import { UiDateTimeState } from '../common/datetime.state';
import { IDate } from '../common/datetime.interface';

@Component({
    selector: 'ui-month-selector',
    template: `
        <div class="ui-datetime-container">
            <ui-period-switch [period]="date?.format('YYYY')"
                              [enabled]="enabled"
                              [prevEnabled]="isPrevEnabled"
                              [nextEnabled]="isNextEnabled"
                              [displayMode]="'year'"
                              (prev)="previousPeriod()"
                              (next)="nextPeriod()"
                              (periodChange)="switchMode($event)">
            </ui-period-switch>
            <ul class="months-of-year ui-datetime-dates">
                <li *ngFor="let dateElement of dateListing; let index = index;" class="month-of-year ui-datetime-date"
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
export class UiMonthSelectorComponent extends AbstractSelectorComponent {

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(state: UiDateTimeState) {
        super(state, 'month');
        this.stepsPerRow = 3;
        this.stepsPerCol = 1;
        this.perdiodIncrement = 1;
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    // Override super method
    generateDateListing(): IDate[] {
        this.start = this.value.month(0);
        this.end = this.value.month(11);

        let setSelected: boolean = false;

        const dateElements: IDate[] = [];
        for (let monthNum = 0; monthNum < 12; monthNum++) {
            let current: Moment = this.value.month(monthNum);
            let dateElement: IDate = {
                mode: this.displayMode,
                text: current.format('MMMM'),
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
                    this.focusIndex = monthNum;
                }
            }
            dateElements.push(dateElement);
        }

        return dateElements;
    }
}
