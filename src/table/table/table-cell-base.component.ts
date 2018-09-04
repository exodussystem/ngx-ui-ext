/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 3/19/2017.
 */

import { Component, Input } from '@angular/core';
import { ITableColumn } from '../config/column-config';

// Base component to override to provide
// custom component rendered in table cell
@Component({
    template: ``
})
export class UiTableCellBaseComponent {

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input() row: Object;
    @Input() column: ITableColumn;
    @Input() key: string;
    @Input() value: any;
}
