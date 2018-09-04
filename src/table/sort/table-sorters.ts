import { TableConfigBuilder } from '../config/table-config';

export type SORT_ORDER = 'ASC' | 'DESC';

export type SORT_ICON_POS = 'left'|'right';

export const SORT_CYCLES: SORT_ORDER[] = ['ASC', 'DESC', null];

// global configuration of sorting columns
// this configuration can be overridden by column config
export interface ITableSortConfig {
    sortIconPos?: SORT_ICON_POS;// position of sort icon. 'left'|'right'
    className?: string;         // additional CSS class(es) that should be added to sort header
    defaultClassName?: string;  // additional CSS class(es) that should be added to sort header (NO SORT)
    ascClassName?: string;      // additional CSS class(es) that should be added to sort header (ASC)
    descClassName?: string;     // additional CSS class(es) that should be added to sort header (DESC)
}

export const DEFAULT_TABLE_SORT_CONFIG : ITableSortConfig = {
    sortIconPos: 'right',
    className: 'col-sort col-sort-right',
    ascClassName: 'col-sort-asc',
    descClassName: 'col-sort-desc',
    defaultClassName: 'col-sort-default'
}

/* method-chaining config builder */
export class TableSortConfigBuilder {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _parent: TableConfigBuilder;

    private _config: ITableSortConfig = null;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(config?: ITableSortConfig, parent?: TableConfigBuilder) {
        this._config = Object.assign({}, DEFAULT_TABLE_SORT_CONFIG, config || {});
        this._parent = parent;
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    public and(): TableConfigBuilder {
        return this._parent;
    }

    public getConfig(): ITableSortConfig {
        return this._config;
    }

    public className(className: string): TableSortConfigBuilder {
        if (!!className && className.length > 0)
            this._config.className = className;
        return this;
    }

    public ascClassName(className: string): TableSortConfigBuilder {
        if (!!className && className.length > 0)
            this._config.ascClassName = className;
        return this;
    }

    public descClassName(className: string): TableSortConfigBuilder {
        if (!!className && className.length > 0)
            this._config.descClassName = className;
        return this;
    }

    public defaultClassName(className: string): TableSortConfigBuilder {
        if (!!className && className.length > 0)
            this._config.defaultClassName = className;
        return this;
    }

    public sortIconPos(sortIconPos: SORT_ICON_POS): TableSortConfigBuilder {
        this._config.sortIconPos = sortIconPos;
        return this;
    }
}