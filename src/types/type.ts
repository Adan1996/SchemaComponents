import React from "react";

export interface IColumnConfig<T> {
    align?: "start" | "center" | "end";
    defaultSortDesc?: boolean;
    hidden?: boolean;
    hoverTitle?: string;
    isFilterable?: boolean;
    renderCell?: (rowData: T, index: number) => React.ReactElement | null;
    renderData?: (rowData: T, index: number) => string;
    sort?: (a: T, b: T, sortAsc: boolean) => number;
    sortByValue?: boolean;
    sortable?: boolean;
    title?: string | React.ReactElement;
    width?: number;
    order?: number;
}

export interface IRenderData {
    _index: number;
    [key: string]: any;
}