/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 4/24/2017.
 */

import { animate, AnimationTriggerMetadata, AUTO_STYLE, state, style, transition, trigger } from '@angular/animations';

export const SLIDE_UPDOWN_ANIMATION: AnimationTriggerMetadata =
    trigger('slideUpDown', [
        state('expanded',
            style({
                'height': AUTO_STYLE,
                'padding-top': AUTO_STYLE,
                'padding-bottom': AUTO_STYLE,
                'overflow-y': AUTO_STYLE
            })),
        state('collapsed',
            style({
                'height': 0,
                'padding-top': 0,
                'padding-bottom': 0,
                'overflow-y': 'hidden'
            })),
        transition('collapsed <=> expanded', [
            style({
                'overflow-y': 'hidden',
            }),
            animate(150)
        ]),
        //http://stackoverflow.com/questions/37904860/angular-2-animate-no-visible-effect-of-the-void-transition-when-changin
        //https://github.com/angular/angular/issues/9350#issuecomment-227354109
        /*
         make sure to apply the animation to the host element / the component itself.
         Not to an element within component.
         And make it display: block;.
         host: {
         '[@slideUpDown]': 'true',
         'style': 'display: block;'
         },
         */
        transition('void => expanded', [
            // THIS style is applied at the BEGINNING of transition, when the component is added to DOM.
            style({
                'height': 0,
                'padding-top': 0,
                'padding-bottom': 0,
                'overflow-y': 'hidden'
            }),
            // Transition start is delayed for 2s after comp was added to DOM, duration is 1s.
            animate('150ms ease-in',
                // THIS is the TARGET/END style of the transition.
                style({
                    'height': AUTO_STYLE,
                    'padding-top': AUTO_STYLE,
                    'padding-bottom': AUTO_STYLE
                })
            )
        ])
    ])