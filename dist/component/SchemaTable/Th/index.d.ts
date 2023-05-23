import { oas31 } from "openapi3-ts";
import { CSSProperties, Dispatch, SetStateAction } from "react";
import { IColumnConfig } from "../../../types/type";
interface IThProps {
    columnFilters?: {
        [prop: string]: any;
    };
    config?: IColumnConfig<any>;
    isSortable: boolean;
    name: string;
    schema: oas31.SchemaObject;
    setColumnFilters?: Dispatch<SetStateAction<{
        [prop: string]: any;
    } | undefined>>;
    setSortAsc: Dispatch<SetStateAction<boolean>>;
    setSortColumn: Dispatch<SetStateAction<string>>;
    sortAsc?: boolean;
    style: CSSProperties;
}
declare const _default: ({ columnFilters, config, isSortable, name, schema, setColumnFilters, setSortAsc, setSortColumn, sortAsc, style, }: IThProps) => import("react/jsx-runtime").JSX.Element;
export default _default;
