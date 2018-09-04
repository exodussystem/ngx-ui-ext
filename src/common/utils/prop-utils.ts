/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 * on 8/16/2017.
 */

export class PropertyUtils {

    private static  REGEX_ATTR: RegExp = new RegExp('[\[\].()]','g');

    public static isEmptyObject(object: any): boolean {
        for (let prop in object) {
            if(object.hasOwnProperty(prop))
                return false;
        }
        // return JSON.stringify(obj) === JSON.stringify({});
        return true;
    }

    /*
     Return value of object attribute.
     Support
     - nested attribute ('address.city')
     - function('mailingAddress()')
     - indexed attribute ('addresses[0].state')
     - all combined ('addresses[0].state.getCodeName().label')
     */
    public static getValueFromObject(object: any, attr: string): any {
        if (!object)
            return object;
        if (!attr || typeof object !== 'object') {
            return object.toString();
        }
        // if simple attribute (no special chars found such as '[]().'),
        // then return it right away
        if (!this.REGEX_ATTR.test(attr)){
            return object[attr];
        }
        // convert indexed attribute (etc from 'names[0]' to 'names.0')
        let properties: string = attr.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '');

        // loop through all nested properties
        return properties.split('.').reduce((object: any, attr: string) => {
            // if it is function
            if (attr.endsWith('()')) {
                // remove parentheses
                let functionName = attr.slice(0, attr.length - 2);
                // invoke function as object property
                return object[functionName]();
            }
            else {
                return object[attr];
            }
        }, object);
    }
}