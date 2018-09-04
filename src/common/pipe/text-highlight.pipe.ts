/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 6/29/2017.
 */

import {PipeTransform, Pipe} from '@angular/core';
import { CharUtils } from '../utils/char-utils';
import { TextHighlightUtils } from '../utils/highlight-utils';

/** Usage:
 * <input type="text" [(ngModel)]="filter">
 * <div [innerHTML]="myAwesomeText  | textHighlight : filter"></div>
 *
 */

@Pipe({ name: 'textHighlight' })
export class TextHighLightPipe implements PipeTransform {
	transform(text: string, query: string, tag?: string, highlightClass?: string, matchLatin?: boolean): string {
        if (true === matchLatin)
            return TextHighlightUtils.highlightLatinText(text, query, tag||'strong', highlightClass||'');
        else
            return TextHighlightUtils.highlightText(text, query, tag||'strong', highlightClass||'');
	}
}