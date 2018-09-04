/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 * on 7/29/2017.
 */

export class DomUtils {

    // return index of given element within its parent
    public static getElementIndex (element: HTMLElement): number {
        let index: number = Array.from(element.parentElement.children).indexOf(element);
        return index < 0 ? 0 : index;
    }

    public static turnOffAutocomplete(element: HTMLElement): void {
        element.setAttribute('autocorrect','off');
        element.setAttribute('autocapitalize','off');
        element.setAttribute('spellcheck','false');
        element.setAttribute('autocomplete','off');
    }

}