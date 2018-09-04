/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 * on 12/20/2016.
 */

export class RegexTreeUtils {

    public static test(value: string, regex: any): boolean {

        if (typeof regex === 'string') {
            let testRegex: RegExp = new RegExp(regex);
            return testRegex.test(value);
        }

        if (regex instanceof RegExp) {
            return regex.test(value);
        }
        else if (regex && Array.isArray(regex.and)) {
            return regex.and.every((item) => {
                return RegexTreeUtils.test(value, item);
            });
        }
        else if (regex && Array.isArray(regex.or)) {
            return regex.or.some((item) => {
                return RegexTreeUtils.test(value, item);
            });
        }
        else if (regex && regex.not) {
            return !RegexTreeUtils.test(value, regex.not);
        }
        else {
            return false;
        }
    }

    public static exec(value: string, regex: any): (boolean|RegExpExecArray) {
        if (typeof regex === 'string') {
            let testRegex: RegExp = new RegExp(regex);
            return testRegex.exec(value);
        }

        if (regex instanceof RegExp) {
            return regex.exec(value);
        }
        else if (regex && Array.isArray(regex)) {
            return regex.reduce((res, item) => {
                return (!!res) ? res : RegexTreeUtils.exec(value, item);
            }, null);
        }
        else {
            return null;
        }
    }
}
