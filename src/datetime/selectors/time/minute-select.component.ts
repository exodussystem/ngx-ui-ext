import { Component, ElementRef } from '@angular/core';
import { Moment } from 'moment';
import { AbstractSelectorComponent } from '../common/abstract-select.component';
import { UiDateTimeState } from '../common/datetime.state';
import { IDate } from '../common/datetime.interface';

@Component({
    selector: 'ui-minute-selector',
    template: `
        <div class="ui-datetime-container">
            <ul class="minutes-of-hour ui-datetime-dates">
                <li *ngFor="let dateElement of dateListing; let index = index;" class="minute-of-hour ui-datetime-date"
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
export class UiMinuteSelectorComponent extends AbstractSelectorComponent {

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(state: UiDateTimeState) {
        super(state, 'minute');
        this.stepsPerRow = 15;
        this.stepsPerCol = 5;
        this.perdiodIncrement = 5;
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    // Override super method
    generateDateListing(): IDate[] {
        this.start = this.value.minute(0);
        this.end = this.value.minute(59);

        let setSelected: boolean = false;

        const dateElements: IDate[] = [];
        for (let i = 0; i < 60; i = i + 5) {
            let current: Moment = this.value.minute(i);
            let dateElement: IDate = {
                mode: this.displayMode,
                text: current.format('mm'),
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
                    this.focusIndex = i;
                }
            }
            dateElements.push(dateElement);
        }

        return dateElements;
    }
}
