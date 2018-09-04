/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 8/17/2017.
 */

import { PipeTransform, Pipe } from '@angular/core';
import { TextHighlightUtils } from '../utils/highlight-utils';

@Pipe({name: 'htmlHighlight'})
export class HtmlHighLightPipe implements PipeTransform {
    transform(html: string, query: string, tag: string = 'span', highlightClass: string = 'highlight'): string {
        return TextHighlightUtils.highlightHTML(html, query, tag, highlightClass);
    }
}