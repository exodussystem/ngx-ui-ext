/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 5/30/2017.
 */

import { Type } from '@angular/core';
import { IModalOption } from './modal.interface';

export function UiModalOptions(option?: IModalOption) {
    return function (dialogType: Type<any>) {
        Reflect.defineMetadata("uimodaloption", option, dialogType);
    }
}