import { IMaskConfig } from './input-mask.service';
/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 5/11/2017.
 */

export class InputMaskState {
    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------
    public previousConformedValue: string;
    public previousPlaceholder: string;
    public caretPosition: number;
    // stores the last value for comparison
    public lastValue: string;
    public config: IMaskConfig;
}
