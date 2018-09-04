
import { animate, AnimationTriggerMetadata, AUTO_STYLE, state, style, transition, trigger } from '@angular/animations';

export const FADE_IN_ANIMATION: AnimationTriggerMetadata =
    trigger('fadeIn', [
        // route 'enter' transition
        transition(':enter', [

            // styles at start of transition
            style({opacity: 0}),

            // animation and styles at end of transition
            animate('.3s', style({opacity: 1}))
        ]),
    ]);