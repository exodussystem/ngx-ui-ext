/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 3/21/2017.
 */

import { TableConfigBuilder } from '../config/table-config';

// configuration of pagination
// Reference: ngx-bootstrap / Pagination
//  https://valor-software.com/ngx-bootstrap/#/pagination
export interface ITablePagingConfig {
    maxSize: number;                    // limit number for page links in pager
    itemsPerPage: number;               // maximum number of items per page.
                                        // If value less than 1, it will display all items on one page
    boundaryLinks?: boolean;            // if false first and last buttons will be hidden
    directionLinks?: boolean;           // if false previous and next buttons will be hidden
    firstText?: string;                 // first button text
    previousText?: string;              // previousText
    nextText?: string;                  // next button text
    lastText?: string;                  // last button text
    pageBtnClass?: string;              // add class to
    rotate?: boolean;                   // if true current page will in the middle of pages list

    // custom configuration
    itemsPerPageOptions?: Array<string>;// list of page size options
}

// method-chaining config builder
export class TablePagingConfigBuilder {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _parent: TableConfigBuilder;

    private _config: ITablePagingConfig = null;

    private _defaultConfig: ITablePagingConfig = {
        maxSize: void 0,
        itemsPerPage: 10,
        boundaryLinks: false,
        directionLinks: true,
        firstText: 'First',
        previousText: 'Previous',
        nextText: 'Next',
        lastText: 'Last',
        pageBtnClass: '',
        rotate: true,
        itemsPerPageOptions: ['10', '25', '50', '100']
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(config?: ITablePagingConfig, parent?: TableConfigBuilder) {
        this._config = Object.assign({}, this._defaultConfig, config || {});
        this._parent = parent;
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    public and(): TableConfigBuilder {
        return this._parent;
    }

    public getConfig(): ITablePagingConfig {
        return this._config;
    }

    public firstText(firstText: string): TablePagingConfigBuilder {
        if (!!firstText && firstText.length > 0)
            this._config.firstText = firstText;
        return this;
    }

    public lastText(lastText: string): TablePagingConfigBuilder {
        if (!!lastText && lastText.length > 0)
            this._config.lastText = lastText;
        return this;
    }

    public previousText(previousText: string): TablePagingConfigBuilder {
        if (!!previousText && previousText.length > 0)
            this._config.previousText = previousText;
        return this;
    }

    public nextText(nextText: string): TablePagingConfigBuilder {
        if (!!nextText && nextText.length > 0)
            this._config.nextText = nextText;
        return this;
    }

    public pageBtnClass(pageBtnClass: string): TablePagingConfigBuilder {
        if (!!pageBtnClass && pageBtnClass.length > 0)
            this._config.pageBtnClass = pageBtnClass;
        return this;
    }

    public boundaryLinks(boundaryLinks: boolean = true): TablePagingConfigBuilder {
        this._config.boundaryLinks = boundaryLinks;
        return this;
    }

    public directionLinks(directionLinks: boolean = true): TablePagingConfigBuilder {
        this._config.directionLinks = directionLinks;
        return this;
    }

    public rotate(rotate: boolean = true): TablePagingConfigBuilder {
        this._config.rotate = rotate;
        return this;
    }

    public itemsPerPageOptions(itemsPerPageOptions: Array<string>): TablePagingConfigBuilder {
        if (!!itemsPerPageOptions && itemsPerPageOptions.length > 0)
            this._config.itemsPerPageOptions = itemsPerPageOptions;
        return this;
    }

    public maxSize(maxSize: number = 0): TablePagingConfigBuilder {
        this._config.maxSize = maxSize;
        return this;
    }

    public itemsPerPage(itemsPerPage: number = 100): TablePagingConfigBuilder {
        this._config.itemsPerPage = itemsPerPage;
        return this;
    }
}

// store the current status of table column
export interface ITablePagingState extends ITablePagingConfig {
    totalItems?: number;                // current total number of items in all pages
    numPages?: number;                  // total pages
    page?: number;                      // current/active page index
    start?: number;                     // starting entry index
    end?: number;                       // ending entry index
}
