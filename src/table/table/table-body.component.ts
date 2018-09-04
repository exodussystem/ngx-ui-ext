/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 3/13/2017.
 */

import { Component, Input } from '@angular/core';
import { UiTableState } from '../config/table-state';
import { DecimalPipe } from '@angular/common/common';

@Component({
    selector: '[uiTableBody]',
    template: `
        <!-- column filters -->
        <tr *ngIf="state.config?.filtering==='column' && state.hasAnyFilters" uiTableFilterRow></tr>
        <tr *ngFor="let row of rows" uiTableRow [row]="row"></tr>
        <tr *ngIf="rows?.length === 0">
            <td [attr.colspan]="state.totalColumns">
                <pre>{{state.config.noMatchText}}</pre>
            </td>
        </tr>
  `
})
export class UiTableBody {

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input() rows: Array<any>;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(public state: UiTableState) {
    }
}