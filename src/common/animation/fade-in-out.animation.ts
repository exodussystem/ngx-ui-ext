/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 8/28/2017.
 */

import { animate, AnimationTriggerMetadata, style, transition, trigger } from '@angular/animations';

export const FADE_INOUT_ANIMATION: AnimationTriggerMetadata =
    trigger('fadeInOut', [
        transition(':enter', [   // :enter is alias to 'void => *'
            style({opacity: 0}),
            animate(500, style({opacity: 1}))
        ]),
        transition(':leave', [   // :leave is alias to '* => void'
            animate(500, style({opacity: 0}))
        ])
    ]);