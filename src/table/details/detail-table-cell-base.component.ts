/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 4/21/2017.
 */

import { Component, Input } from "@angular/core";

// Base component to override to provide
// custom component rendered in table cell
@Component({
    template: ``
})
export class UiDetailTableCellBaseComponent {

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input() row: Object;
}
