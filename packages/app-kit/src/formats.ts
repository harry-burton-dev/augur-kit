/**
 * How the person wants dates and times written, as the shell gives it on the mount context
 * (`ctx.formats`, SDK 2.0). Any part left out means the browser's. The words stay English.
 */
export interface AppFormats {
  /** Their language, such as `de`. */
  language?: string;
  /** The language tag to write dates in, such as `en-GB`. */
  locale?: string;
  /** IANA, such as `Europe/London`. */
  timeZone?: string;
  hourCycle?: 'h12' | 'h23';
}

/** A formatter for `options`, written their way. A tag this browser can't use falls back to the browser's own. */
export const dateTimeFormat = (options: Intl.DateTimeFormatOptions, formats: AppFormats = {}) => {
  const extra: Intl.DateTimeFormatOptions = {
    ...(formats.timeZone && !options.timeZone ? { timeZone: formats.timeZone } : {}),
    ...(formats.hourCycle && options.hour ? { hourCycle: formats.hourCycle } : {}),
  };
  try {
    return new Intl.DateTimeFormat(formats.locale, { ...options, ...extra });
  } catch {
    return new Intl.DateTimeFormat(undefined, options);
  }
};

/** `when`, written the person's way: `writeDate(doc.updatedAt, { dateStyle: 'medium' }, useFormats())`. */
export const writeDate = (when: string | number | Date, options: Intl.DateTimeFormatOptions, formats: AppFormats = {}) =>
  dateTimeFormat(options, formats).format(new Date(when));

/** The calendar day a moment falls on in `timeZone` (the browser's without it), as a key to compare days by. */
export const dayKey = (when: Date, timeZone?: string) => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', ...(timeZone ? { timeZone } : {}) }).formatToParts(when);
    const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    return `${part('year')}-${part('month')}-${part('day')}`;
  } catch {
    return `${when.getFullYear()}-${when.getMonth() + 1}-${when.getDate()}`;
  }
};
