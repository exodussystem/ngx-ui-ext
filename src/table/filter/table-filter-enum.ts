import { Component, Input, OnInit } from '@angular/core';
import { UiTableState } from '../config/table-state';
import { IColumnFilterConfig } from './column-filter';
import { DEFAULT_SELECT_SETTINGS, ISelectSettings  } from '../../select/select/select.interface';
import { PropertyUtils } from '../../common/utils/prop-utils';

@Component({
    selector: '[uiTableEnumFilter]',
    template: `
            <label class="sr-only" attr.for="{{state.config.tableId + '-filter-' + filter.key}}">Search Column: </label>
            <ui-select id="{{state.config.tableId + '-filter-' + filter.key}}"
                       [options]="filter.selectOptions" multiple="true"
                       [settings]="dropdownSettings"
                       [(ngModel)]="selectedOptions"
                       (selectionAdded)="onFilterValueAdded($event)"
                       (selectionRemoved)="onFilterValueRemoved($event)">
            </ui-select>
    `,
    styles: [`
        :host {
            padding: 0 4px;
        }
        ui-select {
            width: 95%;
            width: calc(100% - 8px);
            margin: 0;
        }
        :host >>> .btn.btn-select {
            text-align: center !important;
        }
    `]
})
export class UiTableEnumFilter implements OnInit {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    selectedOptions: Array<any> = [];

    dropdownSettings: ISelectSettings =
        Object.assign({}, DEFAULT_SELECT_SETTINGS,
            {
                bodyContainer: true,
                animation: false,
                allowClear: false,
                enableSearch: false,
                selectionLimit: 0,
                closeOnSelect: false,
                showCheckAll: true,
                showUncheckAll: false,
                dynamicTitleMaxItems: 1,
                width: 'fit',
                maxHeight: '300px',
                showAllSelectedText: true,
                allSelectedText: 'All Selected',
                checkAllText: 'Select All',
                uncheckAllText: 'Unselect All',
                checkedSingularText: 'selected',
                checkedPluralText: 'selected',
                searchPlaceholder: 'Search...'
            }
        );

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input() filter: IColumnFilterConfig;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(public state: UiTableState) {
    }

    // -------------------------------------------------------------------------
    // Lifecycle callbacks
    // -------------------------------------------------------------------------

    // implements OnInit
    ngOnInit(): void {
        if (this.filter.selectSettings)  {
            this.dropdownSettings = Object.assign({}, this.dropdownSettings, this.filter.selectSettings)
        }

        this.filter.filterSelection = {};

        if (this.filter.selectOptions) {
            // By default, select all options
            this.selectedOptions = this.selectedOptions.concat(this.filter.selectOptions);

            // initialize filtered values to include all values from option objects
            this._updateFilterValues(this.filter.selectOptions, true);
        }
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    onFilterValueAdded(valuesAdded: any[]): void {
        this._updateFilterValues(valuesAdded, true)
        this.state.notify();
    }

    onFilterValueRemoved(valuesRemoved: any[]): void {
        this._updateFilterValues(valuesRemoved, false)
        this.state.notify();
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private _updateFilterValues(values: any[], selected: boolean = true) {
        if (!values || values.length===0)
            return;

        // *** Note: In ENUM filtering, filterSelection will be a map of keyword to boolean
        // true means the corresponding key is selected, false otherwise

        values.forEach((option: any) => {
            let value: any = PropertyUtils.getValueFromObject(option, this.dropdownSettings.optionValueField);
            if (value)
                this.filter.filterSelection[value] = selected;
        });
    }
}