import { Component, ElementRef } from '@angular/core';
import { Moment } from 'moment';
import { AbstractSelectorComponent } from '../common/abstract-select.component';
import { UiDateTimeState } from '../common/datetime.state';
import { IDate } from '../common/datetime.interface';

@Component({
    selector: 'ui-hour-selector',
    template: `
        <div class="ui-datetime-container">
            <ul class="hours-of-day ui-datetime-dates">
                <li *ngFor="let dateElement of dateListing; let index = index;" class="hour-of-day ui-datetime-date"
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
export class UiHourSelectorComponent extends AbstractSelectorComponent {

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(state: UiDateTimeState) {
        super(state, 'hour');
        this.stepsPerRow = 3;
        this.stepsPerCol = 1;
        this.perdiodIncrement = 1;
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    // Override super method
    generateDateListing(): IDate[] {
        this.start = this.value.hour(this.value.hour() < 12 ? 0 : 12);
        this.end = this.start.clone().hour(this.start.hour()  + 12);

        let setSelected: boolean = false;

        const dateElements: IDate[] = [];
        for (let i = 1; i < 13; i++) {
            let current: Moment = this.start.clone().add(i, 'hour');
            let dateElement: IDate = {
                mode: this.displayMode,
                text: current.format('hh'),
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
            if (!setSelected && this.isSame(this.value, current)) {
                dateElement.selected = true;
                setSelected = true;
                if (this.focusIndex === -3) {
                    this.focusIndex = i-1;
                }
            }
            dateElements.push(dateElement);
        }

        return dateElements;
    }
}
