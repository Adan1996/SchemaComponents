import React from "react";
import { oas31 } from "openapi3-ts";
import { VariableSizeList, VariableSizeGrid } from "react-window";
import { localeFormat } from "../../inc/date";
import { camelTextToTitleText } from "../../inc/string";
import Th from "./Th";
import {IColumnConfig, IRenderData} from "../../types/type";

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
    searchPlaceholder?: string;
}

export default function SchemaTableComponent<T>(props: ISchemaTableComponentProps<T>) {
    const {
        config,
        data,
        defaultSortColumn,
        defaultSortAsc = false,
        Heading = VariableSizeList,
        isSearchable,
        isSortable,
        onRowClick,
        getRowClassName,
        getRowSelected,
        rowHeight = 36,
        schema,
        style,
        customElement,
        tableTitle,
        searchPlaceholder
    } = props;
    const [sortColumn, setSortColumn] = React.useState(
        defaultSortColumn as string
    );
    const [sortAsc, setSortAsc] = React.useState<boolean>(defaultSortAsc);
    const [searchQuery, setSearchQuery] = React.useState<string>("");
    const [columnFilters, setColumnFilters] = React.useState<{
        [prop: string]: any;
    }>();

    const { properties = {} } = schema;
    const columnNames = React.useMemo<string[]>(() => {
        const columns = Object.keys(properties);
        if (!config) {
            return columns;
        }

        const invisibleColumns = Object.entries(config).reduce<string[]>(
            (prev, [propName, propConfig]) => {
                if (propConfig.hidden) {
                    prev.push(propName);
                }
                return prev;
            },
            []
        );

        return columns
            .filter((key) => !invisibleColumns.includes(key))
            .sort((columnA, columnB) => {
                let orderA = config[columnA] ? config[columnA].order : undefined;
                if (orderA === undefined) {
                    orderA = Object.keys(properties).findIndex(
                        (propName) => propName === columnA
                    );
                }
                let orderB = config[columnB] ? config[columnB].order : undefined;
                if (orderB === undefined) {
                    orderB = Object.keys(properties).findIndex(
                        (propName) => propName === columnB
                    );
                }
                if (orderA === -1) {
                    return 1;
                }
                if (orderB === -1) {
                    return -1;
                }
                return orderA - orderB;
            });
    }, [config, properties]);

    const renderData = React.useMemo<IRenderData[] | undefined>(
        () =>
            data
                ? data.map((object, rowIndex) =>
                    columnNames.reduce(
                        (prev: IRenderData, propName) => {
                            const schema = properties[propName] as oas31.SchemaObject;
                            const propConfig = config ? config[propName] : undefined;
                            if (propConfig?.renderData) {
                                prev[propName] = propConfig.renderData(object, rowIndex);
                                return prev;
                            }
                            if (!schema) {
                                prev[propName] = "?";
                                return prev;
                            }
                            const rawValue = object[propName as keyof T] as any;
                            switch (schema.type) {
                                case "array":
                                    prev[propName] = JSON.stringify(rawValue);
                                    return prev;

                                case "boolean":
                                    prev[propName] = rawValue ? "✓" : "✕";
                                    return prev;

                                case "integer":
                                    prev[propName] = [undefined, null].includes(rawValue)
                                        ? ""
                                        : `${rawValue}`;
                                    return prev;

                                // @ts-ignore
                                case "string":
                                    if (schema.format === "date" && rawValue) {
                                        prev[propName] =
                                            (rawValue as string) === "2999-12-31"
                                                ? "-"
                                                : localeFormat(new Date(rawValue), "dd MMM yyyy");
                                        return prev;
                                    }
                                    if (schema.format === "date-time" && rawValue) {
                                        prev[propName] = localeFormat(
                                            new Date(rawValue),
                                            "dd MMM yyyy hh:mm"
                                        );
                                        return prev;
                                    }
                                    if (schema.enum) {
                                        prev[propName] = camelTextToTitleText(rawValue);
                                        return prev;
                                    }
                                // fallthrough

                                default:
                                    prev[propName] = rawValue ? `${rawValue}` : "";
                                    return prev;
                            }
                        },
                        { _index: rowIndex }
                    )
                )
                : undefined,
        [columnNames, config, data, properties]
    );

    const gridWidth = props.width;
    const columnCount = columnNames.length;
    const { columnWidths, dynamicWidthColumnCount, fixedWidthColumnsWidth } =
        React.useMemo(() => {
            let fixedWidthColumnsWidth = 0;
            let dynamicWidthColumnCount = 0;
            columnNames.forEach((propName) => {
                const propConfig = config ? config[propName] : undefined;
                if (propConfig?.width) {
                    fixedWidthColumnsWidth += propConfig.width;
                } else {
                    dynamicWidthColumnCount += 1;
                }
            }, 0);
            const dynamicColumnWidth = Math.floor(
                (gridWidth - 16 - fixedWidthColumnsWidth) / dynamicWidthColumnCount
            );
            const columnWidths = columnNames.map((propName) => {
                const propConfig = config ? config[propName] : undefined;
                return propConfig?.width || dynamicColumnWidth;
            });
            return { columnWidths, dynamicWidthColumnCount, fixedWidthColumnsWidth };
        }, [columnNames, config, gridWidth]);
    const getColumnWidth = React.useCallback(
        (columnIndex: number) => columnWidths[columnIndex],
        [columnWidths]
    );

    const SchemaTableTh = React.useCallback(
        ({ style, index }: { style: React.CSSProperties; index: number }) => {
            const propName = columnNames[index];
            return (
                <Th
                    columnFilters={columnFilters}
                    config={config ? config[propName] : undefined}
                    isSortable={!!isSortable}
                    name={propName}
                    schema={properties[propName] as oas31.SchemaObject}
                    setColumnFilters={setColumnFilters}
                    setSortColumn={setSortColumn}
                    setSortAsc={setSortAsc}
                    sortAsc={sortColumn === propName ? sortAsc : undefined}
                    style={style}
                />
            );
        },
        [
            columnFilters,
            columnNames,
            config,
            isSortable,
            properties,
            sortAsc,
            sortColumn,
        ]
    );

    const filteredRenderData = React.useMemo(() => {
        let result = renderData;
        if (!result) {
            return result;
        }
        if (searchQuery) {
            const lcQuery = searchQuery.toLowerCase();
            result = result.filter(
                (item) =>
                    !!columnNames.find((columnName) =>
                        // @ts-ignore
                        `${item[columnName]}`.toLowerCase().includes(lcQuery)
                    )
            );
        }
        if (!columnFilters) {
            return result;
        }
        const columnFilterEntries = Object.entries(columnFilters);
        return result.filter((item) =>
            columnFilterEntries.find(
                ([columnName, columnFilterValue]) =>
                    // @ts-ignore
                    data[item._index][columnName] === columnFilterValue
            )
        );
    }, [columnFilters, columnNames, data, renderData, searchQuery]);

    // Sort the filtered data
    const sortedRenderData = React.useMemo(() => {
        if (!sortColumn || !filteredRenderData) {
            return filteredRenderData;
        }
        const sortSchema = properties[sortColumn as string] as
            | oas31.SchemaObject
            | undefined;

        const propConfig = config ? config[sortColumn] : undefined;
        const columnSort = propConfig?.sort;
        if (columnSort) {
            return filteredRenderData.sort((a, b) => {
                const aData = data[a._index];
                const bData = data[b._index];
                if (!aData) {
                    return 1;
                }
                if (!bData) {
                    return -1;
                }
                return columnSort(aData, bData, sortAsc);
            });
        }

        return filteredRenderData.sort((a, b) => {
            const sortByValue =
                propConfig?.sortByValue === undefined
                    ? !sortSchema ||
                    sortSchema.type === "boolean" ||
                    sortSchema.type === "integer" ||
                    sortSchema.format === "date" ||
                    sortSchema.format === "date-time" ||
                    propConfig?.renderCell
                    : propConfig.sortByValue;
            const x =
                sortByValue && data[a._index]
                    ? // @ts-ignore
                    data[a._index][sortColumn]
                    : a[sortColumn as string].toLowerCase();
            const y =
                sortByValue && data[b._index]
                    ? // @ts-ignore
                    data[b._index][sortColumn]
                    : b[sortColumn as string].toLowerCase();
            if (x === y) {
                return 0;
            }
            return (x < y ? 1 : -1) * (sortAsc ? -1 : 1);
        });
    }, [config, data, filteredRenderData, properties, sortAsc, sortColumn]);

    const onTdClick = React.useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!sortedRenderData || !onRowClick) {
                return;
            }
            const { rowIndex } = e.currentTarget.dataset;
            if (!rowIndex) {
                return;
            }
            const row = sortedRenderData[parseInt(rowIndex, 10)];
            onRowClick(data[row._index], row._index, e);
        },
        [data, onRowClick, sortedRenderData]
    );

    const Td = React.useCallback(
        ({ columnIndex, rowIndex, style }: any): React.ReactElement | null => {
            if (!sortedRenderData) {
                return null;
            }
            const propName = columnNames[columnIndex];
            const propConfig = config ? config[propName] : undefined;
            const row = sortedRenderData[rowIndex];
            const schema = properties[propName] as oas31.SchemaObject;
            const tdDivProps = {
                "data-row-index": rowIndex,
                "data-column-index": columnIndex,
                key: propName,
                style,
                onClick: !propConfig?.renderCell ? onTdClick : undefined,
                className: `schema-table__td schema-table__td--${
                    rowIndex % 2 ? "odd" : "even"
                }${
                    row && getRowSelected && getRowSelected(data[row._index])
                        ? " schema-table__td--selected"
                        : ""
                } ${
                    row && getRowClassName
                        ? getRowClassName(data[row._index], sortedRenderData)
                        : ""
                }`,
            };

            if (propConfig?.renderCell) {
                return (
                    <div {...tdDivProps}>
                        {propConfig.renderCell(data[row._index], rowIndex)}
                    </div>
                );
            }

            if (!schema) {
                return null;
            }

            // @ts-ignore
            switch (schema.type) {
                case "boolean":
                    tdDivProps.className += ` text-${propConfig?.align || "center"}`;
                    break;
                case "number":
                case "integer":
                    tdDivProps.className += ` text-${propConfig?.align || "end"}`;
                    break;

                case "string":
                    // @ts-ignore
                    tdDivProps.title = row[propName];
                    if (schema.format === "date" || schema.format === "date-time") {
                        tdDivProps.className += ` text-${propConfig?.align || "end"}`;
                    }
            }

            return <div {...tdDivProps}>{row[propName]}</div>;
        },
        [
            sortedRenderData,
            columnNames,
            config,
            properties,
            onTdClick,
            getRowSelected,
            data,
            getRowClassName,
        ]
    );

    const onSearchChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchQuery(e.currentTarget.value);
        },
        []
    );

    const getRowHeight = React.useCallback(() => rowHeight, [rowHeight]);
    const width = dynamicWidthColumnCount ? gridWidth : fixedWidthColumnsWidth;
    const totalWidth = React.useMemo(
        () =>
            columnWidths.reduce((a, b) => {
                return a + b;
            }, 0),
        [columnWidths]
    );
    return (
        <div
            className={`schema-table${
                onRowClick ? " schema-table--clickable-rows" : ""
            }`}
            style={{
                ...style,
                width: dynamicWidthColumnCount ? gridWidth : fixedWidthColumnsWidth,
            }}
        >
            <div className={"tableTitle"}>{tableTitle}</div>
            <div className={"form-action-container"}>
                <div className={"flex-1"}>
                    {isSearchable ? (
                        <input
                            id={"input-filter"}
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={onSearchChange}
                            autoFocus
                        />
                    ) : null}
                </div>
                {customElement}
            </div>
            <Heading
                key={`thead_${width}_${sortColumn}_${sortAsc}_${searchQuery}`}
                height={50}
                itemCount={columnCount}
                itemSize={getColumnWidth}
                layout="horizontal"
                width={width}
                sortAsc={sortAsc}
                setSortAsc={setSortAsc}
                setSortColumn={setSortColumn}
                sortColumn={sortColumn}
                sortedRenderData={sortedRenderData}
            >
                {SchemaTableTh}
            </Heading>
            <VariableSizeGrid
                className="schema-table__tbody"
                key={`tbody_${width}_${sortColumn}_${sortAsc}_${searchQuery}_${columnCount}`}
                height={props.height - (isSearchable ? 50 : 0)}
                width={totalWidth}
                columnWidth={getColumnWidth}
                rowHeight={getRowHeight}
                columnCount={columnCount}
                rowCount={sortedRenderData ? sortedRenderData.length : 0}
            >
                {Td}
            </VariableSizeGrid>
        </div>
    );
}
