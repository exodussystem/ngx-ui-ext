/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 7/18/2017.
 */

import { IColumnSorter } from '../sort/column-sorter';
import { IColumnFilter } from '../filter/column-filter';

export class UiTablePlugin {
    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private static _sorters: Map<string, IColumnSorter> =
        new Map<string, IColumnSorter>();

    private static _filters: Map<string, IColumnFilter> =
        new Map<string, IColumnFilter>();

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    public static registerSorter(type: any, sorter: IColumnSorter): void {
        if (typeof type === 'string') {
            UiTablePlugin._sorters.set(<string>type, sorter);
        }
        else {
            UiTablePlugin._sorters.set(JSON.stringify(type), sorter);
        }
    }

    public static getSorter(type: any): IColumnSorter {
        if (typeof type === 'string') {
            return UiTablePlugin._sorters.get(<string>type);
        }
        else {
            return UiTablePlugin._sorters.get(JSON.stringify(type));
        }
    }

    public static registerFilter(type: any, filter: IColumnFilter): void {
        if (typeof type === 'string') {
            UiTablePlugin._filters.set(<string>type, filter);
        }
        else {
            UiTablePlugin._filters.set(JSON.stringify(type), filter);
        }
    }

    public static getFilter(type: any): IColumnFilter {
        if (typeof type === 'string') {
            return UiTablePlugin._filters.get(<string>type);
        }
        else {
            return UiTablePlugin._filters.get(JSON.stringify(type));
        }
    }
}