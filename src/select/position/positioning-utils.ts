/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 8/29/2017.
 */

export interface IBoundaryRect extends ClientRect {
    placement?: string;
}

export interface IPlacement {
    primary?: string;
    secondary?: string
    auto?: boolean
}

/**
 * A set of utility methods for working with the DOM.
 * It is meant to be used where we need to absolute-position elements in
 * relation to another element (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
 */
export class PositioningUtils {

    /**
     * Used by scrollbarWidth() function to cache scrollbar's width.
     * Do not access this variable directly, use scrollbarWidth() instead.
     */
    public static SCROLLBAR_WIDTH: number;
    /**
     * scrollbar on body and html element in IE and Edge overlay
     * content and should be considered 0 width.
     */
    public static BODY_SCROLLBAR_WIDTH: number;

    public static OVERFLOW_REGEX = {
        normal: /(auto|scroll)/,
        hidden: /(auto|scroll|hidden)/
    };

    public static PLACEMENT_REGEX = {
        auto: /\s?auto?\s?/i,
        primary: /^(top|bottom|left|right)$/,
        secondary: /^(top|bottom|left|right|center)$/,
        vertical: /^(top|bottom)$/
    };

    public static BODY_REGEX = /(HTML|BODY)/;

    private static getStyle(element: HTMLElement, prop: string): string {
        return (window.getComputedStyle(element) as any)[prop];
    }

    private static isStaticPositioned(element: HTMLElement): boolean {
        return (PositioningUtils.getStyle(element, 'position') || 'static') === 'static';
    }

    /**
     * Provides a parsed number for a style property.  Strips
     * units and casts invalid numbers to 0.
     *
     * @param {string} value - The style value to parse.
     *
     * @returns {number} A valid number.
     */
    private static parseStyle(value: string): number {
        let numericValue = parseFloat(value);
        return isFinite(numericValue) ? numericValue : 0;
    }

    /**
     * Provides the closest positioned ancestor.
     *
     * @param {element} element - The element to get the offest parent for.
     *
     * @returns {element} The closest positioned ancestor.
     */

    private static offsetParent(element: HTMLElement): HTMLElement {
        let offsetParentEl: HTMLElement = <HTMLElement>element.offsetParent || document.documentElement;

        while (offsetParentEl
                && offsetParentEl !== document.documentElement
                && PositioningUtils.isStaticPositioned(offsetParentEl)) {
            offsetParentEl = <HTMLElement>offsetParentEl.offsetParent;
        }

        return offsetParentEl || document.documentElement;
    }

    /**
     * Provides the scrollbar width, concept from TWBS measureScrollbar()
     * function in https://github.com/twbs/bootstrap/blob/master/js/modal.js
     * In IE and Edge, scollbar on body and html element overlay and should
     * return a width of 0.
     *
     * @returns {number} The width of the browser scollbar.
     */
    public static scrollbarWidth(isBody: boolean): number {
        if (isBody) {
            if (!PositioningUtils.BODY_SCROLLBAR_WIDTH) {
                let bodyElem: HTMLElement = <HTMLElement>document.querySelector('body');
                bodyElem.classList.add('uib-position-body-scrollbar-measure');
                PositioningUtils.BODY_SCROLLBAR_WIDTH = window.innerWidth - bodyElem[0].clientWidth;
                PositioningUtils.BODY_SCROLLBAR_WIDTH = isFinite(PositioningUtils.BODY_SCROLLBAR_WIDTH)
                                                        ? PositioningUtils.BODY_SCROLLBAR_WIDTH : 0;
                bodyElem.classList.remove('uib-position-body-scrollbar-measure');
            }
            return PositioningUtils.BODY_SCROLLBAR_WIDTH;
        }
        /* TODO: Find way to add and remove a DOM element dynamically in Angular
        if (!PositioningUtils.SCROLLBAR_WIDTH) {
            let bodyElem: HTMLElement = <HTMLElement>document.querySelector('body');

            let scrollElem = $('<div class="uib-position-scrollbar-measure"></div>');
            bodyElem.appendChild(scrollElem)
            PositioningUtils.SCROLLBAR_WIDTH = scrollElem[0].offsetWidth - scrollElem[0].clientWidth;
            PositioningUtils.SCROLLBAR_WIDTH = isFinite(PositioningUtils.SCROLLBAR_WIDTH) ? PositioningUtils.SCROLLBAR_WIDTH : 0;
            scrollElem.remove();
        }*/

        return PositioningUtils.SCROLLBAR_WIDTH;
    }

    /**
     * Provides the padding required on an element to replace the scrollbar.
     *
     * @returns {object} An object with the following properties:
     *   <ul>
     *     <li>**scrollbarWidth**: the width of the scrollbar</li>
     *     <li>**widthOverflow**: whether the the width is overflowing</li>
     *     <li>**right**: the amount of right padding on the element needed to replace the scrollbar</li>
     *     <li>**rightOriginal**: the amount of right padding currently on the element</li>
     *     <li>**heightOverflow**: whether the the height is overflowing</li>
     *     <li>**bottom**: the amount of bottom padding on the element needed to replace the scrollbar</li>
     *     <li>**bottomOriginal**: the amount of bottom padding currently on the element</li>
     *   </ul>
     */
    public static scrollbarPadding(element: HTMLElement ): any {

        let elemStyle: CSSStyleDeclaration = window.getComputedStyle(element);
        let paddingRight: number = PositioningUtils.parseStyle(elemStyle.paddingRight);
        let paddingBottom: number = PositioningUtils.parseStyle(elemStyle.paddingBottom);
        let scrollParent: HTMLElement = PositioningUtils.scrollParent(element, false, true);
        let scrollbarWidth: number = PositioningUtils.scrollbarWidth(PositioningUtils.BODY_REGEX.test(scrollParent.tagName));

        return {
            scrollbarWidth: scrollbarWidth,
            widthOverflow: scrollParent.scrollWidth > scrollParent.clientWidth,
            right: paddingRight + scrollbarWidth,
            originalRight: paddingRight,
            heightOverflow: scrollParent.scrollHeight > scrollParent.clientHeight,
            bottom: paddingBottom + scrollbarWidth,
            originalBottom: paddingBottom
        };
    }

    /**
     * Checks to see if the element is scrollable.
     *
     * @param {HTMLElement} element - The element to check.
     * @param {boolean=} [includeHidden=false] - Should scroll style of 'hidden' be considered,
     *   default is false.
     *
     * @returns {boolean} Whether the element is scrollable.
     */
    public static isScrollable(element: HTMLElement, includeHidden: boolean = false): boolean {
        let overflowRegex = includeHidden
                            ? PositioningUtils.OVERFLOW_REGEX.hidden
                            : PositioningUtils.OVERFLOW_REGEX.normal;
        let elemStyle: CSSStyleDeclaration = window.getComputedStyle(element);
        return overflowRegex.test(elemStyle.overflow + elemStyle.overflowY + elemStyle.overflowX);
    }

    /**
     * Provides the closest scrollable ancestor.
     * A port of the jQuery UI scrollParent method:
     * https://github.com/jquery/jquery-ui/blob/master/ui/scroll-parent.js
     *
     * @param {HTMLElement} element - The element to find the scroll parent of.
     * @param {boolean=} [includeHidden=false] - Should scroll style of 'hidden' be considered,
     *   default is false.
     * @param {boolean=} [includeSelf=false] - Should the element being passed be
     * included in the scrollable llokup.
     *
     * @returns {element} A HTML element.
     */
    public static scrollParent(element: HTMLElement, includeHidden: boolean = false, includeSelf: boolean = false): HTMLElement {

        let overflowRegex = includeHidden
                            ? PositioningUtils.OVERFLOW_REGEX.hidden
                            : PositioningUtils.OVERFLOW_REGEX.normal;
        let documentEl: HTMLElement = document.documentElement;
        let elemStyle: CSSStyleDeclaration = window.getComputedStyle(element);
        if (includeSelf && overflowRegex.test(elemStyle.overflow + elemStyle.overflowY + elemStyle.overflowX)) {
            return element;
        }
        let excludeStatic: boolean = elemStyle.position === 'absolute';
        let scrollParent: HTMLElement = element.parentElement || documentEl;

        if (scrollParent === documentEl || elemStyle.position === 'fixed') {
            return documentEl;
        }

        while (scrollParent.parentElement && scrollParent !== documentEl) {
            let spStyle: CSSStyleDeclaration = window.getComputedStyle(scrollParent);
            if (excludeStatic && spStyle.position !== 'static') {
                excludeStatic = false;
            }

            if (!excludeStatic && overflowRegex.test(spStyle.overflow + spStyle.overflowY + spStyle.overflowX)) {
                break;
            }
            scrollParent = scrollParent.parentElement;
        }

        return scrollParent;
    }

    /**
     * Provides read-only equivalent of jQuery's position function:
     * http://api.jquery.com/position/ - distance to closest positioned
     * ancestor.  Does not account for margins by default like jQuery position.
     *
     * @param {HTMLElement} element - The element to caclulate the position on.
     * @param {boolean=} [includeMargins=false] - Should margins be accounted
     * for, default is false.
     *
     * @returns {object} An object with the following properties:
     *   <ul>
     *     <li>**width**: the width of the element</li>
     *     <li>**height**: the height of the element</li>
     *     <li>**top**: distance to top edge of offset parent</li>
     *     <li>**left**: distance to left edge of offset parent</li>
     *   </ul>
     */
    public static position(element: HTMLElement , includeMagins: boolean = false, round = true): ClientRect {

        let elemOffset = PositioningUtils.offset(element, false);
        if (includeMagins) {
            let elemStyle: CSSStyleDeclaration = window.getComputedStyle(element);
            elemOffset.top -= PositioningUtils.parseStyle(elemStyle.marginTop);
            elemOffset.left -= PositioningUtils.parseStyle(elemStyle.marginLeft);
        }
        let parent = PositioningUtils.offsetParent(element);
        let parentOffset = {top: 0, left: 0};

        if (parent !== document.documentElement) {
            parentOffset = PositioningUtils.offset(parent);
            parentOffset.top += parent.clientTop - parent.scrollTop;
            parentOffset.left += parent.clientLeft - parent.scrollLeft;
        }
        let width: number = elemOffset.width ? elemOffset.width : element.offsetWidth;
        let height: number = elemOffset.height ? elemOffset.height : element.offsetHeight;
        let top: number = elemOffset.top - parentOffset.top;
        let left: number = elemOffset.left - parentOffset.left;
        if (round) {
            return {
                width: Math.round(width),
                height: Math.round(height),
                top: Math.round(top),
                left: Math.round(left),
                bottom: Math.round(top + height),
                right: Math.round(left + width)
            };
        }
        else {
            return {
                width: width,
                height: height,
                top: top,
                left: left,
                bottom: top + height,
                right: left + width
            }
        }
    }

    /**
     * Provides read-only equivalent of jQuery's offset function:
     * http://api.jquery.com/offset/ - distance to viewport.  Does
     * not account for borders, margins, or padding on the body
     * element.
     *
     * @param {HTMLElement} element - The element to calculate the offset on.
     *
     * @returns {object} An object with the following properties:
     *   <ul>
     *     <li>**width**: the width of the element</li>
     *     <li>**height**: the height of the element</li>
     *     <li>**top**: distance to top edge of viewport</li>
     *     <li>**right**: distance to bottom edge of viewport</li>
     *   </ul>
     */
    public static offset(element: HTMLElement, round = true): ClientRect {
        const elBcr: ClientRect = element.getBoundingClientRect();
        const viewportOffset = {
            // Old version
            // top: window.pageYOffset - document.documentElement.clientTop,
            // left: window.pageXOffset - document.documentElement.clientLeft
            top: window.pageYOffset || document.documentElement.scrollTop,
            left: window.pageXOffset || document.documentElement.scrollLeft
        };

        let elOffset: ClientRect;
        if (round) {
            elOffset = {
                height: Math.round(elBcr.height || element.offsetHeight),
                width: Math.round(elBcr.width || element.offsetWidth),
                top: Math.round(elBcr.top + viewportOffset.top),
                bottom: Math.round(elBcr.bottom + viewportOffset.top),
                left: Math.round(elBcr.left + viewportOffset.left),
                right: Math.round(elBcr.right + viewportOffset.left)
            };
        }
        else {
            elOffset = {
                height: elBcr.height || element.offsetHeight,
                width: elBcr.width || element.offsetWidth,
                top: elBcr.top + viewportOffset.top,
                bottom: elBcr.bottom + viewportOffset.top,
                left: elBcr.left + viewportOffset.left,
                right: elBcr.right + viewportOffset.left
            };
        }
        return elOffset;
    }

    /**
     * Provides offset distance to the closest scrollable ancestor
     * or viewport.  Accounts for border and scrollbar width.
     *
     * Right and bottom dimensions represent the distance to the
     * respective edge of the viewport element.  If the element
     * edge extends beyond the viewport, a negative value will be
     * reported.
     *
     * @param {HTMLElement} element - The element to get the viewport offset for.
     * @param {boolean=} [useDocument=false] - Should the viewport be the document element instead
     * of the first scrollable element, default is false.
     * @param {boolean=} [includePadding=true] - Should the padding on the offset parent element
     * be accounted for, default is true.
     * @param {boolean=} [round=true] - Should the padding on the offset parent element
     * be accounted for, default is true.
     *
     * @returns {ClientRect} An object with the following properties:
     *   <ul>
     *     <li>**top**: distance to the top content edge of viewport element</li>
     *     <li>**bottom**: distance to the bottom content edge of viewport element</li>
     *     <li>**left**: distance to the left content edge of viewport element</li>
     *     <li>**right**: distance to the right content edge of viewport element</li>
     *   </ul>
     */
    public static viewportOffset(element: HTMLElement, useDocument: boolean = false, includePadding: boolean = true, round = true) : ClientRect {
        includePadding = includePadding !== false ? true : false;

        let elemBCR = element.getBoundingClientRect();
        let offsetBCR = {top: 0, left: 0, bottom: 0, right: 0};

        let offsetParent: HTMLElement = useDocument ? document.documentElement : PositioningUtils.scrollParent(element);
        let offsetParentBCR = offsetParent.getBoundingClientRect();

        offsetBCR.top = offsetParentBCR.top + offsetParent.clientTop;
        offsetBCR.left = offsetParentBCR.left + offsetParent.clientLeft;
        if (offsetParent === document.documentElement) {
            offsetBCR.top += window.pageYOffset;
            offsetBCR.left += window.pageXOffset;
        }
        offsetBCR.bottom = offsetBCR.top + offsetParent.clientHeight;
        offsetBCR.right = offsetBCR.left + offsetParent.clientWidth;

        if (includePadding) {
            let offsetParentStyle: CSSStyleDeclaration = window.getComputedStyle(offsetParent);
            offsetBCR.top += PositioningUtils.parseStyle(offsetParentStyle.paddingTop);
            offsetBCR.bottom -= PositioningUtils.parseStyle(offsetParentStyle.paddingBottom);
            offsetBCR.left += PositioningUtils.parseStyle(offsetParentStyle.paddingLeft);
            offsetBCR.right -= PositioningUtils.parseStyle(offsetParentStyle.paddingRight);
        }
        let top: number = elemBCR.top - offsetBCR.top;
        let bottom: number = offsetBCR.bottom - elemBCR.bottom;
        let left: number = elemBCR.left - offsetBCR.left;
        let right: number = offsetBCR.right - elemBCR.right;

        if (round) {
            return {
                width: Math.round(right - left),
                height: Math.round(bottom - top),
                top: Math.round(top),
                left: Math.round(left),
                bottom: Math.round(bottom),
                right: Math.round(right)
            };
        }
        else {
            return {
                width: (right - left),
                height: (bottom - top),
                top: top,
                left: left,
                bottom: bottom,
                right: right
            }
        }
    }

    /**
     * Provides an array of placement values parsed from a placement string.
     * Along with the 'auto' indicator, supported placement strings are:
     *   <ul>
     *     <li>top: element on top, horizontally centered on host element.</li>
     *     <li>top left: element on top, left edge aligned with host element left edge.</li>
     *     <li>top right: element on top, left right edge aligned with host element right edge.</li>
     *     <li>bottom: element on bottom, horizontally centered on host element.</li>
     *     <li>bottom left: element on bottom, left edge aligned with host element left edge.</li>
     *     <li>bottom right: element on bottom, right edge aligned with host element right edge.</li>
     *     <li>left: element on left, vertically centered on host element.</li>
     *     <li>left top: element on left, top edge aligned with host element top edge.</li>
     *     <li>left bottom: element on left, bottom edge aligned with host element bottom edge.</li>
     *     <li>right: element on right, vertically centered on host element.</li>
     *     <li>right top: element on right, top edge aligned with host element top edge.</li>
     *     <li>right bottom: element on right, bottom edge aligned with host element bottom edge.</li>
     *   </ul>
     * A placement string with an 'auto' indicator is expected to be
     * space separated from the placement, i.e: 'auto bottom-left'  If
     * the primary and secondary placement values do not match 'top,
     * bottom, left, right' then 'top' will be the primary placement and
     * 'center' will be the secondary placement.  If 'auto' is passed, true
     * will be returned as the 3rd value of the array.
     *
     * @param {string} placement - The placement string to parse.
     *
     * @returns {IPlacement} An placement interface with the following values
     * <ul>
     *   <li>**primary**: The primary placement.</li>
     *   <li>**secondary**: The secondary placement.</li>
     *   <li>**auto**: If auto is passed: true, else undefined.</li>
     * </ul>
     */
    public static parsePlacement(placement: string): IPlacement {
        let autoPlace: boolean = PositioningUtils.PLACEMENT_REGEX.auto.test(placement);
        if (autoPlace) {
            placement = placement.replace(PositioningUtils.PLACEMENT_REGEX.auto, '');
        }
        let placements: string[] = placement.split(' ');
        let result: IPlacement = {auto: autoPlace};
        result.primary = placements[0] || 'top';
        if (!PositioningUtils.PLACEMENT_REGEX.primary.test(result.primary)) {
            result.primary = 'top';
        }

        result.secondary = placements[1] || 'center';
        if (!PositioningUtils.PLACEMENT_REGEX.secondary.test(result.secondary)) {
            result.secondary = 'center';
        }
        return result;
    }

    /**
     * Provides coordinates for an element to be positioned relative to
     * another element.  Passing 'auto' as part of the placement parameter
     * will enable smart placement - where the element fits. i.e:
     * 'auto left-top' will check to see if there is enough space to the left
     * of the hostElem to fit the targetElem, if not place right (same for secondary
     * top placement).  Available space is calculated using the viewportOffset
     * function.
     *
     * @param {element} hostElem - The element to position against.
     * @param {element} targetElem - The element to position.
     * @param {string=} [placement=top] - The placement for the targetElem,
     *   default is 'top'. 'center' is assumed as secondary placement for
     *   'top', 'left', 'right', and 'bottom' placements.  Available placements are:
     *   <ul>
     *     <li>top</li>
     *     <li>top right</li>
     *     <li>top left</li>
     *     <li>bottom</li>
     *     <li>bottom left</li>
     *     <li>bottom right</li>
     *     <li>left</li>
     *     <li>left top</li>
     *     <li>left bottom</li>
     *     <li>right</li>
     *     <li>right top</li>
     *     <li>right bottom</li>
     *   </ul>
     * @param {boolean=} [appendToBody=false] - Should the top and left values returned
     *   be calculated from the body element, default is false.
     *
     * @returns {object} An object with the following properties:
     *   <ul>
     *     <li>**top**: Value for targetElem top.</li>
     *     <li>**left**: Value for targetElem left.</li>
     *     <li>**placement**: The resolved placement.</li>
     *   </ul>
     */
    public static positionElements(hostElement: HTMLElement, targetElement: HTMLElement,
                                   placement: string = 'top', appendToBody: boolean = false, round = true): IBoundaryRect {

        // need to read from prop to support tests.
        let targetWidth: number = targetElement.offsetWidth;
        let targetHeight: number = targetElement.offsetHeight;

        let placements: IPlacement = PositioningUtils.parsePlacement(placement);
        let primary: string = placements.primary;
        let secondary: string = placements.secondary;

        let hostElemPos = appendToBody
                            ? PositioningUtils.offset(hostElement, false)
                            : PositioningUtils.position(hostElement, false);

        const hostElBCR: ClientRect = hostElement.getBoundingClientRect();
        let targetElemPos: ClientRect = {
            height: hostElBCR.height || targetHeight,
            width: hostElBCR.width || targetWidth,
            top: 0,
            bottom: hostElBCR.height || targetHeight,
            left: 0,
            right: hostElBCR.width || targetWidth
        };

        if (placements.auto) {
            let viewportOffset: ClientRect = PositioningUtils.viewportOffset(hostElement, appendToBody, false);

            let targetElemStyle: CSSStyleDeclaration = window.getComputedStyle(targetElement);
            let adjustedSize = {
                width: targetWidth + Math.round(Math.abs(PositioningUtils.parseStyle(targetElemStyle.marginLeft)
                                                        + PositioningUtils.parseStyle(targetElemStyle.marginRight))),
                height: targetHeight + Math.round(Math.abs(PositioningUtils.parseStyle(targetElemStyle.marginTop)
                                                        + PositioningUtils.parseStyle(targetElemStyle.marginBottom)))
            };

            primary =   primary === 'top' && adjustedSize.height > viewportOffset.top && adjustedSize.height <= viewportOffset.bottom ? 'bottom' :
                        primary === 'bottom' && adjustedSize.height > viewportOffset.bottom && adjustedSize.height <= viewportOffset.top ? 'top' :
                        primary === 'left' && adjustedSize.width > viewportOffset.left && adjustedSize.width <= viewportOffset.right ? 'right' :
                        primary === 'right' && adjustedSize.width > viewportOffset.right && adjustedSize.width <= viewportOffset.left ? 'left' :
                        primary;

            secondary = secondary === 'top' && adjustedSize.height - hostElemPos.height > viewportOffset.bottom && adjustedSize.height - hostElemPos.height <= viewportOffset.top ? 'bottom' :
                        secondary === 'bottom' && adjustedSize.height - hostElemPos.height > viewportOffset.top && adjustedSize.height - hostElemPos.height <= viewportOffset.bottom ? 'top' :
                        secondary === 'left' && adjustedSize.width - hostElemPos.width > viewportOffset.right && adjustedSize.width - hostElemPos.width <= viewportOffset.left ? 'right' :
                        secondary === 'right' && adjustedSize.width - hostElemPos.width > viewportOffset.left && adjustedSize.width - hostElemPos.width <= viewportOffset.right ? 'left' :
                        secondary;

            if (secondary === 'center') {
                if (PositioningUtils.PLACEMENT_REGEX.vertical.test(primary)) {
                    let xOverflow: number = hostElemPos.width / 2 - targetWidth / 2;
                    if (viewportOffset.left + xOverflow < 0 && adjustedSize.width - hostElemPos.width <= viewportOffset.right) {
                        secondary = 'left';
                    }
                    else if (viewportOffset.right + xOverflow < 0 && adjustedSize.width - hostElemPos.width <= viewportOffset.left) {
                        secondary = 'right';
                    }
                }
                else {
                    let yOverflow: number = hostElemPos.height / 2 - adjustedSize.height / 2;
                    if (viewportOffset.top + yOverflow < 0 && adjustedSize.height - hostElemPos.height <= viewportOffset.bottom) {
                        secondary = 'top';
                    }
                    else if (viewportOffset.bottom + yOverflow < 0 && adjustedSize.height - hostElemPos.height <= viewportOffset.top) {
                        secondary = 'bottom';
                    }
                }
            }
        }

        switch (primary) {
            case 'top':
                targetElemPos.top = hostElemPos.top - targetHeight;
                break;
            case 'bottom':
                targetElemPos.top = hostElemPos.top + hostElemPos.height;
                break;
            case 'left':
                targetElemPos.left = hostElemPos.left - targetWidth;
                break;
            case 'right':
                targetElemPos.left = hostElemPos.left + hostElemPos.width;
                break;
        }

        switch (secondary) {
            case 'top':
                targetElemPos.top = hostElemPos.top;
                break;
            case 'bottom':
                targetElemPos.top = hostElemPos.top + hostElemPos.height - targetHeight;
                break;
            case 'left':
                targetElemPos.left = hostElemPos.left;
                break;
            case 'right':
                targetElemPos.left = hostElemPos.left + hostElemPos.width - targetWidth;
                break;
            case 'center':
                if (PositioningUtils.PLACEMENT_REGEX.vertical.test(primary)) {
                    targetElemPos.left = hostElemPos.left + hostElemPos.width / 2 - targetWidth / 2;
                } else {
                    targetElemPos.top = hostElemPos.top + hostElemPos.height / 2 - targetHeight / 2;
                }
                break;
        }
        let newPlacement: string = secondary === 'center' ? primary : primary + ' ' + secondary;
        let width: number = hostElBCR.width;
        let height: number = targetHeight;
        if (round) {
            return {
                top : Math.round(targetElemPos.top),
                left : Math.round(targetElemPos.left),
                bottom : Math.round(targetElemPos.top + height),
                right : Math.round(targetElemPos.left + width),
                width: Math.round(width),
                height: Math.round(height),
                placement: newPlacement
            }

        }
        else {
            return {
                top : targetElemPos.top,
                left : targetElemPos.left,
                bottom : targetElemPos.top + height,
                right : targetElemPos.left + width,
                width: width,
                height: height,
                placement: newPlacement
            }
        }
    }

    /**
     * Provides a way to adjust the top positioning after first
     * render to correctly align element to top after content
     * rendering causes resized element height
     *
     * @param {array} placementClasses - The array of strings of classes
     * element should have.
     * @param {object} containerPosition - The object with container
     * position information
     * @param {number} initialHeight - The initial height for the elem.
     * @param {number} currentHeight - The current height for the elem.
     */
    public static adjustTop(placementClasses: string[], containerPosition: any, initialHeight: number, currentHeight: number): any {
        if (placementClasses.indexOf('top') !== -1 && initialHeight !== currentHeight) {
            return {
                top: containerPosition.top - currentHeight + 'px'
            };
        }
    }

    /**
     * Provides a way for positioning tooltip & dropdown
     * arrows when using placement options beyond the standard
     * left, right, top, or bottom.
     *
     * @param {HTMLElement} element - The tooltip/dropdown element.
     * @param {string} placement - The placement for the elem.
     * @param {string} innerClass - class to query container element ('.tooltip-inner' for tooltip/'.popover-inner')
     * @param {string} arrowClass - class to query arrow element ('.tooltip-arrow' for tooltip/'.arrow' otherwise)
     */
    public static positionArrow(element: HTMLElement, placement: string, innerClass: string, arrowClass: string): void {
        innerClass = innerClass || '.popover-inner';
        arrowClass = arrowClass || '.arrow';
        let isTooltip = innerClass === '.tooltip-inner';
        let innerElem: HTMLElement = <HTMLElement>element.querySelector(innerClass);
        let arrowElem: HTMLElement = <HTMLElement>element.querySelector(arrowClass);
        if (!innerElem || !arrowElem) {
            return;
        }
        let placements: IPlacement = PositioningUtils.parsePlacement(placement);
        let primary: string = placements.primary;
        let secondary: string = placements.secondary;

        if (secondary === 'center') {
            // no adjustment necessary - just reset styles
            arrowElem.style.top = '';
            arrowElem.style.bottom = '';
            arrowElem.style.left = '';
            arrowElem.style.right = '';
            return;
        }

        let borderProp: string = 'border-' + primary + '-width';
        let borderWidth: string = PositioningUtils.getStyle(arrowElem, borderProp);

        let borderRadiusProp: string = 'border-';
        if (PositioningUtils.PLACEMENT_REGEX.vertical.test(primary)) {
            borderRadiusProp += primary + '-' + secondary;
        } else {
            borderRadiusProp += secondary + '-' + primary;
        }
        borderRadiusProp += '-radius';
        let borderRadius: string = PositioningUtils.getStyle(isTooltip ? innerElem : element, borderRadiusProp);

        switch (primary) {
            case 'top':
                arrowElem.style.bottom = isTooltip ? '0' : '-' + borderWidth;
                break;
            case 'bottom':
                arrowElem.style.top = isTooltip ? '0' : '-' + borderWidth;
                break;
            case 'left':
                arrowElem.style.right = isTooltip ? '0' : '-' + borderWidth;
                break;
            case 'right':
                arrowElem.style.left = isTooltip ? '0' : '-' + borderWidth;
                break;
        }

        arrowElem.style[secondary] = borderRadius;
    }
}

export function positioningElements(hostElement: HTMLElement, targetElement: HTMLElement, placement: string, appendToBody?: boolean): void {
     const pos: IBoundaryRect = PositioningUtils.positionElements(hostElement, targetElement, placement, appendToBody);
     targetElement.style.top = `${pos.top}px`;
     targetElement.style.left = `${pos.left}px`;
}