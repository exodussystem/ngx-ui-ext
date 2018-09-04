import { ITableSortConfig, TableSortConfigBuilder } from '../sort/table-sorters';
import { ITableFilterConfig, TableFilterConfigBuilder, TABLE_FILTER_TYPE } from '../filter/table-filters';
import { ITablePagingConfig, TablePagingConfigBuilder } from '../paging/table-paging';
import { ITableRowConfig, TableRowConfigBuilder } from './row-config';

// configuration of table
export interface ITableConfig {
    tableId?: string;                   // unique ID identify this table. Value will be generated if nothing provided
    paging?: boolean;                   // enable/disable pagination. Enabling paging will disable scrolling
    sorting?: boolean;                  // enable/disable column sorting
    scrolling?: boolean;                // enable/disable row scrolling. Enabling scrolling will disable paging
    details?: boolean;                  // enable/disable detail row
    resizable?: boolean;                // enable/disable resizing all columns
                                        // however, each column can override this setting
    header?: boolean;                   // show/hide header
    footer?: boolean;                   // show/hide footer
    info?: boolean;                     // show/hide table info (total, start , end...)
    height?: number;                    // set the height of the table when row scrolling is enabled.
                                        // If this value is set, table will scroll within this height
                                        // pagination will be disabled
    filtering?: TABLE_FILTER_TYPE;      // type of filtering 'table'|'column'
    // for 'table', one filtering input will be used for filtering all columns
    // for 'column', each column has its own filter input (if filtering is enabled for that column)

    stickyHeader?: boolean;             // enable/disable sticky header (get stuck when scrolling)
    stickyTop?: number;                 // the top position when the table header get stuck

    className?: string;                 // additional CSS class(es) that should be added to table
    noMatchText?: string;               // display when no matching data found when filtering,
                                        // default is 'No matching record found'
    singularRecordText?: string;        // default is 'record'
    pluralRecordText?: string;          // default is 'records'

    //
    // Configurations
    //

    sortConfig?: ITableSortConfig;      // sort configuration

    filterConfig?: ITableFilterConfig;  // filter configuration

    pagingConfig?: ITablePagingConfig;  // pagination configuration

    rowConfig?: ITableRowConfig;        // row configuration
}

// method-chaining config builder
export class TableConfigBuilder {

    private _sortConfigBuilder: TableSortConfigBuilder;

    private _filterConfigBuilder: TableFilterConfigBuilder;

    private _pagingConfigBuilder: TablePagingConfigBuilder;

    private _rowConfigBuilder: TableRowConfigBuilder;

    private _config: ITableConfig = null;

    private _defaultConfig: ITableConfig = {
        paging: false,
        filtering: null,
        details: false,
        sorting: false,
        header: true,
        footer: false,
        info: true,
        resizable: false,
        stickyHeader: false,
        className: '',
        singularRecordText: 'record',
        pluralRecordText: 'records',
        noMatchText: 'No matching record found'
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(config?: ITableConfig) {
        this._config = Object.assign({}, this._defaultConfig, config || {});
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    public getConfig(): ITableConfig {
        if (this._sortConfigBuilder)
            this._config.sortConfig = this._sortConfigBuilder.getConfig();

        if (this._filterConfigBuilder)
            this._config.filterConfig = this._filterConfigBuilder.getConfig();

        if (this._pagingConfigBuilder)
            this._config.pagingConfig = this._pagingConfigBuilder.getConfig();

        if (this._rowConfigBuilder)
            this._config.rowConfig = this._rowConfigBuilder.getConfig();

        // validate config and throw error if invalid
        this.validate();

        return this._config;
    }

    public tableId(tableId: string): TableConfigBuilder {
        if (!tableId || tableId.length===0)
            throw new Error('Table ID must be valid and unique');
        this._config.tableId = tableId;
        return this;
    }

    public details(details: boolean = true): TableConfigBuilder {
        this._config.details = details;
        return this;
    }

    public filtering(filtering: boolean = true, filterMode: TABLE_FILTER_TYPE = 'table'): TableConfigBuilder {
        this._config.filtering = (filtering === true) ? filterMode : null;
        return this;
    }

    public paging(paging: boolean = true): TableConfigBuilder {
        this._config.paging = paging;
        // mutual exclusive
        if (paging === true) {
            this._config.scrolling = false;
        }
        return this;
    }

    public resizable(resizable: boolean = true): TableConfigBuilder {
        this._config.resizable = resizable;
        return this;
    }

    public scrolling(scrolling: boolean = true): TableConfigBuilder {
        this._config.scrolling = scrolling;
        // mutual exclusive
        if (scrolling === true) {
            this._config.paging = false;
        }
        return this;
    }

    public sorting(sorting: boolean = true): TableConfigBuilder {
        this._config.sorting = sorting;
        return this;
    }

    public stickyHeader(stickyHeader: boolean = true, stickyTop?: number): TableConfigBuilder {
        this._config.stickyHeader = stickyHeader;
        if (stickyHeader)
            this._config.header = true;
        if (stickyTop !== undefined)
            this._config.stickyTop = stickyTop;
        return this;
    }

    public stickyTop(stickyTop: number) {
        this._config.stickyTop = stickyTop;
        return this;
    }

    public header(header: boolean = true): TableConfigBuilder {
        this._config.header = header;
        return this;
    }

    public footer(footer: boolean = true): TableConfigBuilder {
        this._config.footer = footer;
        return this;
    }

    public info(info: boolean = true): TableConfigBuilder {
        this._config.info = info;
        return this;
    }

    public height(height: number = 300) {
        this._config.height = height;
        return this;
    }

    public className(className: string): TableConfigBuilder {
        if (!!className && className.length > 0)
            this._config.className = className;
        return this;
    }

    public noMatchText(noMatchText: string): TableConfigBuilder {
        if (!!noMatchText && noMatchText.length > 0) {
            this._config.noMatchText = noMatchText;
        }
        return this;
    }

    public singularRecordText(singularRecordText: string): TableConfigBuilder {
        if (!!singularRecordText && singularRecordText.length > 0) {
            this._config.singularRecordText = singularRecordText;
            if (!this._config.noMatchText || this._config.noMatchText.length===0) {
                this._config.noMatchText = 'No matching ' + singularRecordText.trim() + ' found.';
            }
        }

        return this;
    }

    public pluralRecordText(pluralRecordText: string): TableConfigBuilder {
        if (!!pluralRecordText && pluralRecordText.length > 0)
            this._config.pluralRecordText = pluralRecordText;
        return this;
    }

    //
    // OTHER BUILDER
    //

    public sortConfig(): TableSortConfigBuilder {
        this._sortConfigBuilder = new TableSortConfigBuilder(null, this);
        return this._sortConfigBuilder;
    }

    public filterConfig(): TableFilterConfigBuilder {
        this._filterConfigBuilder = new TableFilterConfigBuilder(null, this);
        return this._filterConfigBuilder;
    }

    public pagingConfig(): TablePagingConfigBuilder {
        this._pagingConfigBuilder = new TablePagingConfigBuilder(null, this);
        return this._pagingConfigBuilder;
    }

    public rowConfig(): TableRowConfigBuilder {
        this._rowConfigBuilder = new TableRowConfigBuilder(null, this);
        return this._rowConfigBuilder;
    }

    private validate() {
        // Enable detail but row config is not provided
        if (this._config.details && !this._config.rowConfig)
            throw new Error('Row Config must be provided when enabling details row.');

        // Enable detail but detail component is not provided
        if (this._config.details &&
            (this._config.rowConfig && !this._config.rowConfig.detailComponent))
            throw new Error('Detail Component must be provided when enabling details row.');

        // Enable paging but paging config is not provided
        if (this._config.paging && !this._config.pagingConfig)
            throw new Error('Paging Config must be provided when enabling pagination.');

        // Enable sorting but sort config is not provided
        // if (this._config.sorting && !this._config.sortConfig)
        //     throw new Error('Sort Config must be provided when enabling sorting.');

        // Enable sorting but sort config is not provided
        // if (this._config.sorting && !this._config.sortConfig)
        //     throw new Error('Sort Config must be provided when enabling sorting.');

        if (this._config.stickyHeader && !this._config.header) {
            throw new Error('Header must be enabled when enabling sticky header.');
        }

        if (this._config.stickyHeader && this._config.stickyTop === undefined) {
            throw new Error('Sticky top must be set when enabling sticky header.');
        }
    }
}