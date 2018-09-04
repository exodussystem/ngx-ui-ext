import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { UiMultiSelectModule } from '../multiselect/multiselect.module';
import { UiPaginationModule } from '../pagination/pagination.module';
import { UiStickyModule } from '../sticky/sticky.module'
import { UiSelectModule } from '../select/select/select.module'

import { UiTableComponent } from './table/table.component';
import { UiScrollTableComponent } from './scroll/scroll-table.component';
import { UiTableHeaderFooterColumn } from './table/table-head-col.component';
import { UiTableHeaderFooterRow } from './table/table-head-row.component';
import { UiTableResizerDirective } from './table/table-resizer.directive';
import { UiTableCell } from './table/table-cell.component';
import { UiTableRow } from './table/table-row.component';
import { UiTableFilterRow } from './table/table-filter-row.component';
import { UiTableBody } from './table/table-body.component';
import { UiTableCellBaseComponent } from './table/table-cell-base.component';
import { UiTableEnumFilter } from './filter/table-filter-enum';
import { UiTableTextFilter } from './filter/table-filter-text';
import { UiScrollTableBodyComponent } from './scroll/scroll-table-body.component';
import { UiScrollTableRowComponent } from './scroll/scroll-table-row.component';
import { UiDetailTableBodyComponent } from './details/detail-table-body.component';
import { UiDetailTableCellComponent } from './details/detail-table-cell.component';
import { UiDetailTableCellBaseComponent } from './details/detail-table-cell-base.component';
import { UiIconModule } from '../icon/icon.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        UiPaginationModule,
        UiIconModule,
        UiStickyModule,
        UiSelectModule
    ],
    declarations: [
        UiTableEnumFilter,
        UiTableTextFilter,
        UiTableResizerDirective,
        UiTableHeaderFooterColumn,
        UiTableHeaderFooterRow,
        UiTableFilterRow,
        // paging table
        UiTableComponent,
        UiTableBody,
        UiTableRow,
        UiTableCell,
        UiTableCellBaseComponent,
        // scrolling table
        UiScrollTableComponent,
        UiScrollTableBodyComponent,
        UiScrollTableRowComponent,
        // detail table
        UiDetailTableBodyComponent,
        UiDetailTableCellComponent,
        UiDetailTableCellBaseComponent
    ],
    exports: [
        UiTableComponent,
        UiScrollTableComponent,
        UiTableCellBaseComponent,
        UiDetailTableCellBaseComponent
    ],
    providers: [
    ]
})
export class UiTableModule {
}