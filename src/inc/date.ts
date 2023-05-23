import { format } from "date-fns";
import nl from "date-fns/locale/nl";

export const localeFormat = (date: Date | number, dateFormat: string): string =>
    format(date, dateFormat, { locale: nl });
