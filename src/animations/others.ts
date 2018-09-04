/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 9/6/2017.
 */

import {
    style,
    state,
    transition,
    animate,
    keyframes,
    AnimationMetadata
} from '@angular/animations';

export const others = (timing?: string): AnimationMetadata[] => [
    /* default bootstrap modal animation */
    state('bsModalSlideOut', style({
        display: 'none'
    })),
    transition('* => bsModalSlideIn', [
        animate(timing, keyframes([
            style({transform: 'translate3d(0, -25%, 0)', offset: 0}),
            style({transform: 'translate3d(0, 0%, 0)', offset: 1})
        ]))
    ]),
    transition('* => bsModalSlideOut', [
        animate(timing, keyframes([
            style({transform: 'translate3d(0, 0%, 0)', offset: 0}),
            style({transform: 'translate3d(0, -25%, 0)', offset: 1})
        ]))
    ]),
];