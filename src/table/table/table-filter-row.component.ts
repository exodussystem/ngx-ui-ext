/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 3/24/2017.
 */

import { Component } from "@angular/core";
import { UiTableState } from '../config/table-state';

@Component({
    selector: '[uiTableFilterRow]',
    template: `
        <ng-container *ngFor="let column of state.columns">
        <td *ngIf="column.config.visible !== false">
            <div *ngIf="column.hasFilter" [ngSwitch]="column.config.filtering.columnFilterInput">
                <div *ngSwitchCase="'text'" uiTableTextFilter [embedded]="true" [filter]="column.config.filtering"></div>
                <div *ngSwitchCase="'select'" uiTableEnumFilter [filter]="column.config.filtering"></div>
            </div>
        </td>
        </ng-container>
    `,
    styles: [`
        :host > td {
            padding: 0;
            vertical-align: middle;
            background-color: #EEE;
        }
        :host input::-webkit-input-placeholder,
        :host input::-ms-input-placeholder,
        :host input::-moz-placeholder {
            color: #EEE;
        }
    `]
})
export class UiTableFilterRow {

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(public state: UiTableState) {}
}