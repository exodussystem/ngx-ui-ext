import { Component } from '@angular/core';
import { AbstractSelectorComponent } from '../common/abstract-select.component';
import { UiDateTimeState } from '../common/datetime.state';

@Component({
    selector: 'ui-timestamp-selector',
    styles: [`
        :host >>> ui-timestamp-scroller {
            /*padding-right: .5em*/
            padding: 0px 4px;
        }
        :host >>> .ui-datetime-container {
            min-width: auto;
        }
    `
    ],
    template: `
        <div class="ui-datetime-container">
            <ui-time-scroller [date]="date"
                              [format]=" 'hh' "
                              [enabled]="enabled"
                              [displayMode]="'hour'"
                              (prev)="previousPeriod(1, 'hour')"
                              (next)="nextPeriod(1, 'hour')"
                              [prevEnabled]="isPrevHourEnabled"
                              [nextEnabled]="isNextHourEnabled"
                              (periodChange)="switchMode('hour')">
            </ui-time-scroller>
            <span class="ui-datetime-time-period" [class.disabled]="!enabled">:</span>
            <ui-time-scroller [date]="date"
                              [format]=" 'mm' "
                              [displayMode]="'minute'"
                              [enabled]="enabled"
                              (prev)="previousPeriod(1, 'minute')"
                              (next)="nextPeriod(1, 'minute')"
                              [prevEnabled]="isPrevMinuteEnabled"
                              [nextEnabled]="isNextMinuteEnabled"
                              (periodChange)="switchMode('minute')">
            </ui-time-scroller>
            <ui-time-scroller [date]="date"
                              [format]=" 'A' "
                              [displayMode]="'period'"
                              [enabled]="enabled"
                              [prevEnabled]="isAmPmToggleEnabled"
                              [nextEnabled]="isAmPmToggleEnabled"
                              (prev)="togglePmAm($event)"
                              (next)="togglePmAm($event)">
            </ui-time-scroller>
        </div>
    `
})
export class UiTimestampSelectorComponent extends AbstractSelectorComponent {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    protected isPrevHourEnabled: boolean = true;
    protected isNextHourEnabled: boolean = true;
    protected isPrevMinuteEnabled: boolean = true;
    protected isNextMinuteEnabled: boolean = true;
    protected isAmPmToggleEnabled: boolean = true;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(state: UiDateTimeState) {
        super(state, 'second');
    }

    // -------------------------------------------------------------------------
    // Lifecycle callbacks
    // -------------------------------------------------------------------------

    // implements OnChanges
    ngOnChanges(changes: any) {
        if (changes.date && changes.date.currentValue) {

            this.isPrevHourEnabled = this.enablePrevious(this.value, 1, 'hour');
            this.isNextHourEnabled = this.enableNext(this.value, 1, 'hour');

            this.isPrevMinuteEnabled = this.enablePrevious(this.value, 1, 'minute');
            this.isNextMinuteEnabled = this.enableNext(this.value, 1, 'minute');

            if (this.value.hour() < 12) {
                this.isAmPmToggleEnabled = this.enableNext(this.value, 12, 'hour');
            }
            else {
                this.isAmPmToggleEnabled = this.enablePrevious(this.value, 12, 'hour');
            }
        }
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    togglePmAm($event): void {
        if ($event) {
            $event.preventDefault();
            $event.stopPropagation();
        }
        if (this.value.hour() < 12) {
            this.value = this.value.add(12, 'hour');
        }
        else {
            this.value = this.value.subtract(12, 'hour');
        }
    }
}
