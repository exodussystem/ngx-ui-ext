/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 * on 8/1/2017.
 */

export enum Key {
    Backspace = 8,
    Tab = 9,
    Enter = 13,
    Shift = 16,
    Escape = 27,
    ArrowLeft = 37,
    ArrowRight = 39,
    ArrowUp = 38,
    ArrowDown = 40
}

export function isNotControlKey(keyCode: any): boolean {
    return keyCode !== Key.Tab
        && keyCode !== Key.Shift
        && keyCode !== Key.Escape
        && keyCode !== Key.Enter
        && keyCode !== Key.ArrowLeft
        && keyCode !== Key.ArrowUp
        && keyCode !== Key.ArrowRight
        && keyCode !== Key.ArrowDown;
}