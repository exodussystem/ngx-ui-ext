import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UiDateTimeState } from '../common/datetime.state';

@Component({
    selector: 'ui-period-switch',
    template: `
        <div class="ui-datetime-container">
            <span class="ui-datetime-control {{state.settings.iconClass?.previous}}" 
                  [class.arrow-left]="!state.settings.iconClass?.previous"
                  [class.disabled]="!enabled || !prevEnabled"
                  [attr.title]="tooltip('prev')"
                  (click)="emitEvent($event, 'prev')">
            </span>
            <span class="ui-datetime-date-period"
                  [class.disabled]="!enabled"
                  [attr.title]="tooltip('select')"
                  (click)="emitEvent($event, 'periodChange')">
                {{ period }}
            </span>
            <span class="ui-datetime-control {{state.settings.iconClass?.next}}"  
                  [class.arrow-right]="!state.settings.iconClass?.next"
                  [class.disabled]="!enabled || !nextEnabled"
                  [attr.title]="tooltip('next')"
                  (click)="emitEvent($event, 'next')">
            </span>
        </div>
    `
})
export class UIPeriodSwitchComponent {

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input()
    public prevEnabled: boolean = true;

    @Input()
    public nextEnabled: boolean = true;

    @Input()
    public enabled: boolean = true;

    @Input()
    public period: string;

    @Input()
    public displayMode: string;

    @Output()
    public prev: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    public next: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    public periodChange: EventEmitter<any> = new EventEmitter<any>();

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(protected state: UiDateTimeState) {
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    emitEvent($event: any, event: string) {
        if ($event) {
            $event.preventDefault();
            $event.stopPropagation();
        }
        if (!this.enabled)
            return;
        if (event === 'prev' && this.prevEnabled)
            this.prev.emit($event);
        else if (event=== 'next' && this.nextEnabled)
            this.next.emit($event);
        else if (event === 'periodChange')
            this.switchMode($event);
    }

    switchMode($event) {
        this.periodChange.emit($event)
        this.state.dateChangeSource.next({eventName: 'switchMode', setFocus: this.state.settings.supportKeyboard});
    }

    tooltip(action: string): string {
        if (this.state.settings.showTooltip && this.state.settings.tooltipText) {
            const capital = (word: string): string => {
                return word ? word.charAt(0).toUpperCase() + word.substring(1) : '';
            }

            let tooltipName: string = action + capital(this.displayMode)
            return this.state.settings.tooltipText[tooltipName];
        }
        return null;
    }
}
