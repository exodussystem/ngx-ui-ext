/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 6/29/2017.
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'charsRemaining',
	pure: true
})
export class CharsRemainingPipe implements PipeTransform {
	transform(text: string, max: number) {
		let maxLength: number = max || 500;
		let length: number = text ? text.length : 0;
		return (maxLength - length);
	}
}