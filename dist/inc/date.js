import { format } from "date-fns";
import nl from "date-fns/locale/nl";
export const localeFormat = (date, dateFormat) => format(date, dateFormat, { locale: nl });
