/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 * on 9/27/2017.
 */

import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { forwardRef, Provider, Type } from '@angular/core';

export type OnChangeHandler = (value: any) => void;
export type OnTouchedHandler = (value: any) => void;

export function ValueAccessorProviderFactory(type: Type<any>): Provider {
    return {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => type),
        multi: true
    };
}

export function ValidatorProviderFactory(type: Type<any>): Provider {
    return {
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => type),
        multi: true
    };
}