/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 5/4/2017.
 */

import { TableConfigBuilder } from './table-config';

export type POS_FIRST_LAST = 'first' | 'last';

export type TableRowIdGenerator = (row: any)=> string;

// configuration of table row
export interface ITableRowConfig {
    enableSelect?: boolean;             // enable row selection
    selectedClass?: string;             // class for selected row
    toggleSelection?: boolean;          // enable selection toggle
    // use default bootstrap class 'active'
    rowIdKey?: string;                  // the column from which the row ID value is picked up
    rowIdGenerator?: TableRowIdGenerator;// function to generate row ID from row data
    // Important Note: In order to make row selection work, either rowIdKey or rowIdGenerator
    // MUST be provided to return a unique ID of the row.

    //
    // These below settings are for DETAILS table (table with master-detail rows)
    //

    detailComponent?: any;              // component to render for detail row.
                                        // This Component class must extend UiTableDetailCell class
    showAllDetails?: boolean;           // true to show all details when creating table
    controlButtonPos?: POS_FIRST_LAST;  // Position of control buttons (collapse/expand). (First or Last column.)

    collapseButtonClass?: string;       // button class to collapse (Default is 'glyphicon glyphicon-chevron-up')
    expandButtonClass?: string;         // button class to expand (Default is 'glyphicon glyphicon-chevron-down')

    collapseIconClass?: string;         // button icon class to collapse (Default is 'glyphicon glyphicon-chevron-up')
    expandIconClass?: string;           // button icon class to expand (Default is 'glyphicon glyphicon-chevron-down')

    collapseTitle?: string;             // title shown to collapse (Default is 'Click to hide details')
    collapseAllTitle?: string;          // title shown to collapse (Default is 'Click to hide all details')
    expandTitle?: string;               // title shown to expand (Default is 'Click to show details')
    expandAllTitle?: string;            // title shown to expand (Default is 'Click to show all details')
}

// method-chaining config builder
export class TableRowConfigBuilder {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _parent: TableConfigBuilder;

    private _config: ITableRowConfig = null;

    private _defaultConfig: ITableRowConfig = {
        enableSelect: true,         // enable row selection
        selectedClass: 'active',    // default CSS class for selected row
        toggleSelection: true,      // enable selection toggle
        controlButtonPos: 'first',
        collapseButtonClass: 'btn btn-xs btn-info',
        expandButtonClass: 'btn btn-xs btn-info',
        collapseIconClass: 'glyphicon glyphicon-chevron-up',
        expandIconClass: 'glyphicon glyphicon-chevron-down',
        collapseTitle: 'Click to hide details',
        collapseAllTitle: 'Click to hide all details',
        expandTitle: 'Click to expand',
        expandAllTitle: 'Click to show all details'
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(config?: ITableRowConfig, parent?: TableConfigBuilder) {
        this._config = Object.assign({}, this._defaultConfig, config || {});
        this._parent = parent;
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    public and(): TableConfigBuilder {
        return this._parent;
    }

    public getConfig(): ITableRowConfig {
        return this._config;
    }

    public enableSelect(enableSelect: boolean = true, selectedClass?: string): TableRowConfigBuilder {
        this._config.enableSelect = enableSelect;
        if (!!selectedClass && selectedClass.length > 0)
            this._config.selectedClass = selectedClass;
        return this;
    }

    public selectedClass(selectedClass?: string): TableRowConfigBuilder {
        if (!!selectedClass && selectedClass.length > 0)
            this._config.selectedClass = selectedClass;
        return this;
    }

    public toggleSelection(toggleSelection: boolean = true): TableRowConfigBuilder {
        this._config.toggleSelection = toggleSelection;
        return this;
    }

    public rowIdKey(rowIdKey: string): TableRowConfigBuilder {
        if (!!rowIdKey && rowIdKey.length > 0)
            this._config.rowIdKey = rowIdKey;
        return this;
    }

    public rowIdGenerator(rowIdGenerator: TableRowIdGenerator): TableRowConfigBuilder {
        if (!!rowIdGenerator)
            this._config.rowIdGenerator = rowIdGenerator;
        return this;
    }

    public detailComponent(detailComponent: any): TableRowConfigBuilder {
        this._config.detailComponent = detailComponent;
        return this;
    }

    public showAllDetails(showAllDetails: boolean = true): TableRowConfigBuilder {
        this._config.showAllDetails = showAllDetails;
        return this;
    }

    public controlButtonPos(controlButtonPos: POS_FIRST_LAST = 'first'): TableRowConfigBuilder {
        this._config.controlButtonPos = controlButtonPos;
        return this;
    }

    public collapseIconClass(collapseIconClass: string): TableRowConfigBuilder {
        if (!!collapseIconClass && collapseIconClass.length > 0)
            this._config.collapseIconClass = collapseIconClass;
        return this;
    }

    public expandIconClass(expandIconClass: string): TableRowConfigBuilder {
        if (!!expandIconClass && expandIconClass.length > 0)
            this._config.expandIconClass = expandIconClass;
        return this;
    }

    public collapseButtonClass(collapseButtonClass: string): TableRowConfigBuilder {
        if (!!collapseButtonClass && collapseButtonClass.length > 0)
            this._config.collapseButtonClass = collapseButtonClass;
        return this;
    }

    public expandButtonClass(expandButtonClass: string): TableRowConfigBuilder {
        if (!!expandButtonClass && expandButtonClass.length > 0)
            this._config.expandButtonClass = expandButtonClass;
        return this;
    }

    public collapseTitle(collapseTitle: string): TableRowConfigBuilder {
        if (!!collapseTitle && collapseTitle.length > 0)
            this._config.collapseTitle = collapseTitle;
        return this;
    }

    public collapseAllTitle(collapseAllTitle: string): TableRowConfigBuilder {
        if (!!collapseAllTitle && collapseAllTitle.length > 0)
            this._config.collapseAllTitle = collapseAllTitle;
        return this;
    }

    public expandTitle(expandTitle: string): TableRowConfigBuilder {
        if (!!expandTitle && expandTitle.length > 0)
            this._config.expandTitle = expandTitle;
        return this;
    }

    public expandAllTitle(expandAllTitle: string): TableRowConfigBuilder {
        if (!!expandAllTitle && expandAllTitle.length > 0)
            this._config.expandAllTitle = expandAllTitle;
        return this;
    }
}