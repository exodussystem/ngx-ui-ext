/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 * on 1/3/2017.
 */

import { URLSearchParams } from "@angular/http";

export class URLParamUtils {

    /**
     * Serializes the form element so it can be passed to the back end through the url.
     * The objects properties are the keys and the objects values are the values.
     * ex: { "a":1, "b":2, "c":3 } would look like ?a=1&b=2&c=3
     * Reference:
     *      http://stackoverflow.com/questions/39858290/how-to-use-httpparamserializer-in-angular2
     *
     * @param  {Object} obj - form data
     * @returns URLSearchParams - The url encoded system setup
     */
    public static serialize(obj: Object): URLSearchParams {
        let params: URLSearchParams = new URLSearchParams();
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                var element = obj[key];
                params.set(key, element);
            }
        }
        return params;
    }

    /**
     * Converts an object to a parametrised string.
     * Reference:
     *      https://github.com/angular/angular/issues/7370
     * @param object
     * @returns {string}
     */
    public static objectToParams(object): string {
        return Object.keys(object).map((key) => URLParamUtils.isJsObject(object[key])
            ? URLParamUtils.subObjectToParams(encodeURIComponent(key), object[key])
            : `${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`
        ).join('&');
    }

    /**
     * Converts a sub-object to a parametrised string.
     * Reference:
     *      https://github.com/angular/angular/issues/7370
     * @param object
     * @returns {string}
     */
    private static subObjectToParams(key, object): string {
        return Object.keys(object).map((childKey) => URLParamUtils.isJsObject(object[childKey])
            ? URLParamUtils.subObjectToParams(`${key}[${encodeURIComponent(childKey)}]`, object[childKey])
            : `${key}[${encodeURIComponent(childKey)}]=${encodeURIComponent(object[childKey])}`
        ).join('&');
    }

    /**
     * @param object
     * @return boolean
     * */
    private static isJsObject(o): boolean {
        return o !== null && (typeof o === 'function' || typeof o === 'object');
    }
}
