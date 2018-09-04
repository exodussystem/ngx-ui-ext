import { fade } from './fade';
import { bounce } from './bounce';
import { rotate } from './rotate';
import { slide } from './slide';
import { zoom } from './zoom';
import { others } from './others';
import { AnimationTriggerMetadata, trigger } from '@angular/animations';

export const getAnimateTrigger = (
    triggerName: string = 'animate',
    duration: string | number = 500,
    delay: string | number = 0,
    easing: string = 'linear'): AnimationTriggerMetadata => {

    let timing: string = [
        typeof(duration) === 'number' ? `${duration}ms` : duration,
        typeof(delay) === 'number' ? `${delay}ms` : delay,
        easing
    ].join(' ');

    return trigger(triggerName, [
        ...fade(timing),
        ...bounce(timing),
        ...rotate(timing),
        ...slide(timing),
        ...zoom(timing),
        ...others(timing)
    ]);
};
/*
 ANIMATION NAMES:
  FADE:
    fadeIn, fadeOut,
    fadeInDown, fadeOutDown,
    fadeInUp, fadeOutUp,
    fadeInLeft, fadeOutLeft,
    fadeInRight, fadeOutRight

  SLIDE:
    slideIn, slideOut,
    slideInDown, slideOutDown,
    slideInUp, slideOutUp,
    slideInLeft, slideOutLeft,
    slideInRight, slideOutRight

  BOUNCE:
    bounceIn, bounceOut,
    bounceInDown, bounceOutDown,
    bounceInUp, bounceOutUp,
    bounceInLeft, bounceOutLeft,
    bounceInRight, bounceOutRight

  ZOOM:
     zoomIn, zoomOut,
     zoomInDown, zoomOutDown,
     zoomInUp, zoomOutUp,
     zoomInLeft, zoomOutLeft,
     zoomInRight, zoomOutRight

  ROTATE:
     rotateIn, rotateOut,
     rotateInDownLeft, rotateOutDownLeft,
     rotateInDownRight, rotateOutDownRight
     rotateInUpLeft, rotateOutUpLeft,
     rotateInUpRight, rotateOutUpRight,

*/
/*
    NOTES:

    For IE 11 or earlier version, animation is not supported yet.
    Suggested by ANGULAR ANIMATION document, use web-animation-js as polyfill

    https://github.com/web-animations/web-animations-js

    However, there is a bug related to IE11 and translate3d

    Bug: Animating translate3d() in IE 11 does not work with percentages
    https://github.com/web-animations/web-animations-js/issues/142

    So all ZERO percentage should be suffixed with percentage symbol. For example '0%'

 */
