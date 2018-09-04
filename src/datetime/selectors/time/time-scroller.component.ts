import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractSelectorComponent } from '../common/abstract-select.component';
import { UiDateTimeState } from '../common/datetime.state';

@Component({
    selector: 'ui-time-scroller',
    template: `
        <div class="ui-datetime-container">
            <span class="ui-datetime-control {{state.settings.iconClass?.up}}"
                  [class.arrow-up]="!state.settings.iconClass?.up"
                  [class.disabled]="!enabled || !nextEnabled"
                  [attr.title]="tooltip('increment')"
                  (click)="emitEvent($event, 'next')">
            </span>
            <span class="ui-datetime-time-period"
                  [class.disabled]="!enabled"
                  [attr.title]="tooltip('pick')"
                  (click)="emitEvent($event, 'periodChange')">
                {{ value?.format(format) }}
            </span>
            <span class="ui-datetime-control {{state.settings.iconClass?.down}}"
                  [class.arrow-down]="!state.settings.iconClass?.down"
                  [class.disabled]="!enabled || !prevEnabled"
                  [attr.title]="tooltip('decrement')"
                  (click)="emitEvent($event, 'prev')">
            </span>
        </div>
    `
})
export class UiTimeScrollerComponent extends AbstractSelectorComponent {

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input()
    public format: string;

    @Input()
    public prevEnabled: boolean = true;

    @Input()
    public nextEnabled: boolean = true;

    @Input()
    public enabled: boolean = true;

    @Input()
    public displayMode: string;

    @Output()
    public prev: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    public next: EventEmitter<any> = new EventEmitter<any>();

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(state: UiDateTimeState) {
        super(state, 'second');
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    emitEvent($event: any, name: string) {
        if ($event) {
            $event.preventDefault();
            $event.stopPropagation();
        }
        if (!this.enabled)
            return;
        if (name === 'prev' && this.prevEnabled)
            this.prev.emit($event);
        else if (name === 'next' && this.nextEnabled)
            this.next.emit($event);
        else if (name === 'periodChange')
            this.switchMode(event);
    }

    tooltip(action: string): string {
        if (this.state.settings.showTooltip && this.state.settings.tooltipText) {

            const capital = (word: string): string => {
                return word ? word.charAt(0).toUpperCase() + word.substring(1) : '';
            }

            let tooltipName: string;
            if (this.displayMode === 'period')
                tooltipName = 'togglePeriod'
            else
                tooltipName = action + capital(this.displayMode)

            return this.state.settings.tooltipText[tooltipName];
        }
        return null;
    }
}