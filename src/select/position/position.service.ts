/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 7/24/2017.
 */

import { ElementRef, Injectable } from '@angular/core';
import { IBoundaryRect, PositioningUtils } from './positioning-utils';

export interface PositioningOptions {
    /** The DOM element, ElementRef, or a selector string of an element which will be moved */
    element?: HTMLElement | ElementRef | string;

    /** The DOM element, ElementRef, or a selector string of an element which the element will be attached to  */
    target?: HTMLElement | ElementRef | string;

    /**
     * A string of the form 'vert-attachment horiz-attachment' or 'placement'
     * - placement can be "top", "bottom", "left", "right"
     * not yet supported:
     * - vert-attachment can be any of 'top', 'middle', 'bottom'
     * - horiz-attachment can be any of 'left', 'center', 'right'
     */
    attachment?: string;

    /** A string similar to `attachment`. The one difference is that, if it's not provided, `targetAttachment` will assume the mirror image of `attachment`. */
    targetAttachment?: string;

    /** A string of the form 'vert-offset horiz-offset'
     * - vert-offset and horiz-offset can be of the form "20px" or "55%"
     */
    offset?: string;

    /** A string of target's width ('auto'|'fit'|'200px'|'50%'...)
     */
    width?: string;

    /** A string similar to `offset`, but referring to the offset of the target */
    targetOffset?: string;

    /** If true component will be attached to body */
    appendToBody?: boolean;
}

@Injectable()
export class PositionService {

    // return new placement if detects
    public position(options: PositioningOptions): string {
        const {element, target, attachment, appendToBody, width} = options;
        return this.positioningElements(
                    this._getHtmlElement(target),
                    this._getHtmlElement(element),
                    attachment,
                    appendToBody,
                    width);
    }

    private positioningElements(hostElement: HTMLElement, targetElement: HTMLElement, placement: string,
                                appendToBody?: boolean, targetWidth?: string): string {
        const pos: IBoundaryRect = PositioningUtils.positionElements(hostElement, targetElement, placement, appendToBody);
        let newPlacement: string = pos.placement;
        targetElement.style.top = `${pos.top}px`;
        targetElement.style.left = `${pos.left}px`;
        if (targetWidth) {
            if (targetWidth === 'auto')
                targetElement.style.width = `${pos.width}px`;
            else if (targetWidth === 'fit')
                targetElement.style.width = 'auto';
            else
                targetElement.style.width = targetWidth;
        }
        else {
            targetElement.style.width = 'auto';
        }
        return newPlacement;
    }

    private _getHtmlElement(element: HTMLElement | ElementRef | string): HTMLElement {
        // it means that we got a selector
        if (typeof element === 'string') {
            return document.querySelector(element) as HTMLElement;
        }

        if (element instanceof ElementRef) {
            return element.nativeElement;
        }

        return element as HTMLElement;
    }
}
