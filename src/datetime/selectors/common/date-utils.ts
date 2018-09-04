import * as moment from 'moment';
import { Moment, utc } from 'moment';
import { DateTimeSelectorType } from './datetime.interface';

export interface MomentParseFunction {
    (value: any, format?: string | string[], strictParsing?: boolean): moment.Moment;
}

export type ParserFunction = (value: any, parseFn: MomentParseFunction) => Moment;

const dateParseData = {
    separators: ['/', '\\', '-', '.'],
    day: ['DD', 'D'],
    month: ['MM', 'M'],
    year: ['YYYY', 'YY']
};

function generateDateParseFormatsFromParts(firstPart: string[], secondPart: string[], thirdPart: string[]): string[] {
    const result: string[] = [];

    for (const separator of dateParseData.separators) {
        for (const third of thirdPart) {
            for (const second of secondPart) {
                for (const first of firstPart) {
                    result.push(`${first}${separator}${second}${separator}${third}`);
                }
            }
        }
    }

    return result;
}

function generateDateParseFormats(): string[] {
    return [
        ...generateDateParseFormatsFromParts(dateParseData.month, dateParseData.day, dateParseData.year),
        ...generateDateParseFormatsFromParts(dateParseData.day, dateParseData.month, dateParseData.year),
        ...generateDateParseFormatsFromParts(dateParseData.year, dateParseData.month, dateParseData.day),
        ...generateDateParseFormatsFromParts(dateParseData.year, dateParseData.day, dateParseData.month)
    ];
}

const parseFormat: { [type: string]: string[] } = {
    'date': generateDateParseFormats(),
    'datetime': ['LLL'],
    'time': ['H:M', 'hh:mm A', 'LT', 'LTS']
};

export const DEFAULT_DATETIME_FORMAT: { [type: string]: string; } = {
    'date': 'LL',
    'datetime': 'LLL',
    'time': 'LT'
};

export class DateUtils {

    /**
     * Parses the given value as date using moment.js.
     * If value cannot be parsed the invalid Moment object is returned.
     * The calling code should not assume if the method returns local or utc value and
     * must convert value to corresponding form itself.
     */
    public static parserFabric(mode: DateTimeSelectorType, format: string): ParserFunction {
        return (value: any, parseFn: MomentParseFunction): Moment => {
            parseFn = parseFn || utc;

            if (value === null || value === undefined || value === '') {
                return null;
            }

            const formatsToParse = parseFormat[mode || 'date'];
            return parseFn(value, [format, ...formatsToParse], true);
        };
    }

    public static areDatesEqual(d1: Moment, d2: Moment): boolean {
        if (!d1 || !d1.isValid()) {
            throw new Error('First date is not valid.');
        }
        if (!d2 || !d2.isValid()) {
            throw new Error('Second date is not valid.');
        }

        return d1.year() === d2.year() &&
            d1.dayOfYear() === d2.dayOfYear();
    }

    public static decade(date: Moment): Moment[] {
        if (!date || !date.isValid()) {
            throw new Error('Date is not valid');
        }

        // const year: number = date.year();
        // const startYear: number = year - year % 10;
        // const endYear: number = startYear + 9;
        //
        let delta: number = date.year() % 10;
        let start: Moment = date.clone().subtract( delta, 'year')
        let end: Moment = start.clone().add(9, 'year');
        return [
            // date.clone().year(startYear),
            // date.clone().year(endYear)
            start,
            end
        ];
    }

    public static local(value?: any, format?: string | string[], strictParsing?: boolean): moment.Moment {
        return moment(value, format, strictParsing);
    }

    public static getDateFormatSeparator(dateFormat: string): string {
        return dateFormat.replace(/[DMY]/gi, "")[0];
    }
}