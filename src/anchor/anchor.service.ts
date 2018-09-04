/**
 * @license
 * Copyright Exodus System Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file
 */
/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 6/11/2017.
 */

import { ViewContainerRef } from '@angular/core';

export class AnchorService {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private static _anchors: Map<string, ViewContainerRef> =
        new Map<string, ViewContainerRef>();

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    public static register(anchorId: any, viewContainer: ViewContainerRef): void {
        AnchorService._anchors.set(AnchorService._getKeyAsString(anchorId), viewContainer);
    }

    public static deregister(anchorId: any): void {
        AnchorService._anchors.delete(AnchorService._getKeyAsString(anchorId));
    }

    public static getAnchor(anchorId: any): ViewContainerRef {
        if (anchorId instanceof HTMLElement) {
            let element: HTMLElement = <HTMLElement>anchorId;
            let id: string = element.id || element.getAttribute('data-anchor-id');
            if (id)
                return AnchorService._anchors.get(id);
            return null;
        }
        return AnchorService._anchors.get(AnchorService._getKeyAsString(anchorId));
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private static _getKeyAsString(key: any): string {
        if (typeof key === 'string')
            return <string>key;
        else
            return JSON.stringify(key);
    }
}