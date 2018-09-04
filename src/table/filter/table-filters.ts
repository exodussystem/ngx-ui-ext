/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 5/4/2017.
 */

import { TableConfigBuilder } from '../config/table-config';

export type TABLE_FILTER_TYPE = 'table' | 'column';

// global filter configuration
export interface ITableFilterConfig {
    title?: string;                     // tooltip for filter field
    placeholder?: string;               // the placeholder text for the input
    inputClass?: string;                // additional CSS class name added to filter input
    filterValue?: string;               // filter value
    enableIcon?: boolean;               // turn on/off filter icon in global filter
    iconClass?: string;                 // filter icon CSS class name in global filter
    // noMatchText?: string;            // display when no matching data found when filtering,
    //                                  // default is 'No matching entry found'
}

export const DEFAULT_TABLE_FILTER_CONFIG: ITableFilterConfig = {
    title: 'Enter keyword',
    placeholder: 'Filter All Columns',
    inputClass: 'input-sm',
    iconClass: 'glyphicon glyphicon-search',
    filterValue: '',
    enableIcon: true
}

// method-chaining config builder
export class TableFilterConfigBuilder {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _parent: TableConfigBuilder;

    private _config: ITableFilterConfig = null;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(config?: ITableFilterConfig, parent?: TableConfigBuilder) {
        this._config = Object.assign({}, DEFAULT_TABLE_FILTER_CONFIG, config || {});
        this._parent = parent;
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    public and(): TableConfigBuilder {
        return this._parent;
    }

    public getConfig(): ITableFilterConfig {
        return this._config;
    }

    public inputClass(inputClass: string): TableFilterConfigBuilder {
        if (!!inputClass && inputClass.length>0)
            this._config.inputClass = inputClass;
        return this;
    }

    public title(title: string): TableFilterConfigBuilder {
        if (!!title && title.length>0)
            this._config.title = title;
        return this;
    }

    public placeholder(placeholder: string): TableFilterConfigBuilder {
        if (!!placeholder && placeholder.length>0)
            this._config.placeholder = placeholder;
        return this;
    }

    public filterValue(filterValue: string): TableFilterConfigBuilder {
        if (!!filterValue && filterValue.length>0)
            this._config.filterValue = filterValue;
        return this;
    }

    public enableIcon(enableIcon: boolean = true, iconClass?: string): TableFilterConfigBuilder {
        this._config.enableIcon = enableIcon;
        if (!!iconClass && iconClass.length>0)
            this._config.iconClass = iconClass;
        return this;
    }

    public iconClass(iconClass: string): TableFilterConfigBuilder {
        if (!!iconClass && iconClass.length>0)
            this._config.iconClass = iconClass;
        return this;
    }
}