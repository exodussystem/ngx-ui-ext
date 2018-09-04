/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 4/25/2017.
 */

import { Pipe, PipeTransform } from "@angular/core";
import { CharUtils } from '../utils/char-utils';

/** Usage:
 * <ul>
 *     <li *ngFor="let item of _items | filterProperties:{ label: filterText, description: filterText } : 'AND' ">
 *         {{ item.value }} - {{ item.label }} - {{ item.description }}
 *     </li>
 * </ul>
 */
@Pipe({
    name: 'filterProperties'
})
export class FilterPropertiesPipe implements PipeTransform {
    transform(items: any, filter: any, filterOperator: string = 'OR'): any {
        if (filter && Array.isArray(items)) {
            let filterKeys: string[] = Object.keys(filter);
            // in our example, filterKeys = ['label', 'description']
            // and filter[keyName] = filter['label'] = filter['description'] = value of filterText

            // AND operator
            if (filterOperator === 'AND') {
                return items.filter(item =>
                    filterKeys.reduce((memo, keyName) =>
                    (memo && new RegExp(CharUtils.escapeRegexp(filter[keyName]), 'gi').test(item[keyName])) || filter[keyName] === "", true));
            }
            // default filterOperator is OR
            // if (filterOperator === 'OR') {
            else {
                return items.filter(item => {
                    return filterKeys.some((keyName) => {
                        return new RegExp(CharUtils.escapeRegexp(filter[keyName]), 'gi').test(item[keyName]) || filter[keyName] === "";
                    });
                });
            }
        } else {
            return items;
        }
    }
}