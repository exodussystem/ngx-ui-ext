/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 8/16/2017.
 */

import { ITableColumn, ITableColumnConfig, ITableCellTransformer } from '../config/column-config';

export class UiTableUtils {

    /*
        return the display value (text/html) of table using formatter and transformers
        provided in the table column configuration
     */
    public static getCellDisplayValue(value: any, row: any, column: ITableColumn): string {
        let columnConfig: ITableColumnConfig = column.config;
        // user formatter
        if (columnConfig.formatter) {
            return columnConfig.formatter(value, row, column);
        }
        // user transformers
        else if (columnConfig.transformers && columnConfig.transformers.length > 0) {
            let result: any = value;

            let config = columnConfig;
            columnConfig.transformers.some((transformer: ITableCellTransformer) => {
                if (!transformer.pipe) {
                    throw new Error('[pipe] is not set for transformer of column [' + config.label + '].');
                }
                let args: any[];
                // if args() is not defined, just bring over the result to the next transforming pipe
                if (!transformer.args) {
                    args = [result];
                }
                else {
                    args = transformer.args(result, row, column);
                }
                result = transformer.pipe.transform.apply(this, args);
                return (result === null);
                // if null, return true to break the some loop.
                // Otherwise, return false to continue
            })

            return result ? result.toString() : '';
        }
        // user its raw value
        else {
            return value || '';
        }
    }
}