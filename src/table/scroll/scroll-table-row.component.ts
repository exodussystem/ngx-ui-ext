/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 3/23/2017.
 */
import { Component, Input } from "@angular/core";

@Component({
    selector: '[uiTableScrollRow]',
    template: `
        <tr [style.height]="(rowHeight * rowCount) + 'px'">
          <td [attr.colspan]="columnCount" [style.backgroundSize]="'auto ' + rowHeight + 'px'"></td>
        </tr>
    `,
    styles: [`
        :host {
            border: none !important;
        }
        td {
            padding: 0 !important;
            border: none !important;
            background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAlCAYAAACDKIOpAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABtJREFUeNpiuHv37n+G////MzAxAMHQIQACDAC7twbaN2nkgwAAAABJRU5ErkJggg==') 
                        repeat 0 -1px;
        }
    `]
})
export class UiScrollTableRowComponent {
    @Input() rowHeight: number;
    @Input() rowCount: number;
    @Input() columnCount: number;
}