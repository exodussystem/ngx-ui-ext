/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 * on 8/17/2017.
 */

import { CharUtils } from './char-utils';

export class TextHighlightUtils {

    private static  REGEX_TAG: RegExp = new RegExp('<[^<>]*>', 'ig');

    /**  Highlight keywords in HTML
     * @param {string} htmlText
     * @param {string} query
     * @param {string} tag - tag to wrap around matched keywords : <strong> for bold, <span>
     * @param {string} highlightClass - used with other tags such as span: <span class="highlight">
     * @return {string}
     **/
    public static highlightHTML (htmlText: string, query: string, tag: string, highlightClass?: string): string {
        if (!htmlText || htmlText.length==0
            || !query || query.length === 0) {
            return htmlText;
        }
        // get list of tags
        let tagList: RegExpMatchArray = htmlText.match(TextHighlightUtils.REGEX_TAG);
        // Replace tags with token
        let tmpValue: string = htmlText.replace(TextHighlightUtils.REGEX_TAG, '$!$');
        let replaceText: string = '<' + tag + ((highlightClass && highlightClass.length > 0)
                                                ? (' class="' + highlightClass + '"')
                                                : '')
                                + '>$&</' + tag + '>';
        let queryText: string = CharUtils.escapeRegexp(query);
        let queries: string[] = queryText.split(' +');
        if (queries && queries.length > 1)
            queryText = queries.join('|');
        // Replace search words
        htmlText = tmpValue.replace(new RegExp(queryText, 'ig'), replaceText);
        // Reinsert HTML
        for (let i = 0; htmlText.indexOf('$!$') > -1; i++) {
            htmlText = htmlText.replace('$!$', tagList[i]);
        }
        return htmlText;
    }

    /**  Highlight keywords in plain text
     * @param {string} text
     * @param {string} query
     * @param {string} tag - tag to wrap around matched keywords : <strong> for bold, <span>
     * @param {string} highlightClass - used with other tags such as span: <span class="highlight">
     * @return {string}
     **/
    public static highlightText(text: string, query: string, tag: string, highlightClass?: string): string {
        if (!text || text.length==0
            || !query || query.length === 0) {
            return text;
        }
        let replaceText: string = '<' + tag + ((highlightClass && highlightClass.length > 0)
                                                ? (' class="' + highlightClass + '"')
                                                : '')
                                + '>$&</' + tag + '>';
        let queryText: string = CharUtils.escapeRegexp(query);
        let queries: string[] = queryText.split(' +');
        if (queries && queries.length > 1)
            queryText = queries.join('|');
        return text.replace(new RegExp(queryText, 'ig'), replaceText);
    }

    /**  Highlight keywords in plain text and support Latin characters
     * @param {string} latinText
     * @param {string} query
     * @param {string} tag - tag to wrap around matched keywords : <strong> for bold, <span>
     * @param {string} highlightClass - used with other tags such as span: <span class="highlight">
     * @return {string}
     **/
    public static highlightLatinText(latinText: string, query: string, tag: string,  highlightClass?: string): string {
        if (!latinText || latinText.length==0
            || !query || query.length === 0) {
            return latinText;
        }
        let text: string = CharUtils.latinize(latinText);

        let startTag: string = '<' + tag + ((highlightClass && highlightClass.length > 0)
                                            ? (' class="' + highlightClass + '"') : '') + '>';
        let endTag: string = '</' + tag + '>';
        let startTagPlaceholder: string = ' '.repeat(startTag.length);//new Array(startTag.length + 1).join(' ');
        let endTagPlaceholder: string = ' '.repeat(endTag.length);//new Array(endTag.length + 1).join(' ');

        let queryText: string = CharUtils.escapeRegexp(CharUtils.latinize(query));
        let queries: string[] = queryText.split(' +');

        // if multiple keywords found after split by blanks
        if (queries.length > 1) {
            for (let i = 0; i < queries.length; i += 1) {
                let tokenLen: number = queries[i].length;
                if (tokenLen === 0)
                    continue;
                let tokenPlaceholder: string = ' '.repeat(tokenLen);
                let startIdx: number = text.indexOf(queries[i]);
                while (startIdx >= 0) {
                    latinText = latinText.substring(0, startIdx)
                                + startTag + latinText.substring(startIdx, startIdx + tokenLen) + endTag
                                + latinText.substring(startIdx + tokenLen);
                    text = text.substring(0, startIdx)
                                + startTagPlaceholder + tokenPlaceholder + endTagPlaceholder
                                + text.substring(startIdx + tokenLen);
                    startIdx = text.indexOf(queries[i]);
                }
            }
        }
        else {
            let tokenLen: number = queryText.length;
            let tokenPlaceholder: string = ' '.repeat(tokenLen);
            let startIdx: number = text.indexOf(queryText);
            while (startIdx >= 0) {
                latinText = latinText.substring(0, startIdx)
                            + startTag + latinText.substring(startIdx, startIdx + tokenLen) + endTag
                            + latinText.substring(startIdx + tokenLen);
                text = text.substring(0, startIdx)
                            + startTagPlaceholder + tokenPlaceholder + endTagPlaceholder
                            + text.substring(startIdx + tokenLen);
                startIdx = text.indexOf(queryText);
            }
        }
        return latinText;
    }
}