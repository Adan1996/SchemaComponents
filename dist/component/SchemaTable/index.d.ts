import React from "react";
import { oas31 } from "openapi3-ts";
import { IColumnConfig, IRenderData } from "../../types/type";
import "./index.scss";
export interface ISchemaTableComponentProps<T> {
    config?: {
        [propName: string]: IColumnConfig<T>;
    };
    data: T[];
    defaultSortColumn?: keyof T;
    defaultSortAsc?: boolean;
    getRowSelected?: (rowData: T) => boolean;
    Heading?: any;
    isSearchable?: boolean;
    isSortable?: boolean;
    onRowClick?: (rowData: T, rowIndex: number, event: React.MouseEvent) => void;
    getRowClassName?: (rowData: T, filteredSortedRows: IRenderData[]) => string;
    rowHeight?: number;
    schema: oas31.SchemaObject;
    style?: React.CSSProperties;
    width: number;
    height: number;
    customElement?: React.ReactNode;
    tableTitle?: string;
}
export default function SchemaTableComponent<T>(props: ISchemaTableComponentProps<T>): import("react/jsx-runtime").JSX.Element;
