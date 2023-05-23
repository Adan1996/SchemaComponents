import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { VariableSizeList, VariableSizeGrid } from "react-window";
import { localeFormat } from "../../inc/date";
import { camelTextToTitleText } from "../../inc/string";
import Th from "./Th";
import "./index.scss";
export default function SchemaTableComponent(props) {
    const { config, data, defaultSortColumn, defaultSortAsc = false, Heading = VariableSizeList, isSearchable, isSortable, onRowClick, getRowClassName, getRowSelected, rowHeight = 36, schema, style, customElement, tableTitle, } = props;
    const [sortColumn, setSortColumn] = React.useState(defaultSortColumn);
    const [sortAsc, setSortAsc] = React.useState(defaultSortAsc);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [columnFilters, setColumnFilters] = React.useState();
    const { properties = {} } = schema;
    const columnNames = React.useMemo(() => {
        const columns = Object.keys(properties);
        if (!config) {
            return columns;
        }
        const invisibleColumns = Object.entries(config).reduce((prev, [propName, propConfig]) => {
            if (propConfig.hidden) {
                prev.push(propName);
            }
            return prev;
        }, []);
        return columns
            .filter((key) => !invisibleColumns.includes(key))
            .sort((columnA, columnB) => {
            let orderA = config[columnA] ? config[columnA].order : undefined;
            if (orderA === undefined) {
                orderA = Object.keys(properties).findIndex((propName) => propName === columnA);
            }
            let orderB = config[columnB] ? config[columnB].order : undefined;
            if (orderB === undefined) {
                orderB = Object.keys(properties).findIndex((propName) => propName === columnB);
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
    const renderData = React.useMemo(() => data
        ? data.map((object, rowIndex) => columnNames.reduce((prev, propName) => {
            const schema = properties[propName];
            const propConfig = config ? config[propName] : undefined;
            if (propConfig === null || propConfig === void 0 ? void 0 : propConfig.renderData) {
                prev[propName] = propConfig.renderData(object, rowIndex);
                return prev;
            }
            if (!schema) {
                prev[propName] = "?";
                return prev;
            }
            const rawValue = object[propName];
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
                            rawValue === "2999-12-31"
                                ? "-"
                                : localeFormat(new Date(rawValue), "dd MMM yyyy");
                        return prev;
                    }
                    if (schema.format === "date-time" && rawValue) {
                        prev[propName] = localeFormat(new Date(rawValue), "dd MMM yyyy hh:mm");
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
        }, { _index: rowIndex }))
        : undefined, [columnNames, config, data, properties]);
    const gridWidth = props.width;
    const columnCount = columnNames.length;
    const { columnWidths, dynamicWidthColumnCount, fixedWidthColumnsWidth } = React.useMemo(() => {
        let fixedWidthColumnsWidth = 0;
        let dynamicWidthColumnCount = 0;
        columnNames.forEach((propName) => {
            const propConfig = config ? config[propName] : undefined;
            if (propConfig === null || propConfig === void 0 ? void 0 : propConfig.width) {
                fixedWidthColumnsWidth += propConfig.width;
            }
            else {
                dynamicWidthColumnCount += 1;
            }
        }, 0);
        const dynamicColumnWidth = Math.floor((gridWidth - 16 - fixedWidthColumnsWidth) / dynamicWidthColumnCount);
        const columnWidths = columnNames.map((propName) => {
            const propConfig = config ? config[propName] : undefined;
            return (propConfig === null || propConfig === void 0 ? void 0 : propConfig.width) || dynamicColumnWidth;
        });
        return { columnWidths, dynamicWidthColumnCount, fixedWidthColumnsWidth };
    }, [columnNames, config, gridWidth]);
    const getColumnWidth = React.useCallback((columnIndex) => columnWidths[columnIndex], [columnWidths]);
    const SchemaTableTh = React.useCallback(({ style, index }) => {
        const propName = columnNames[index];
        return (_jsx(Th, { columnFilters: columnFilters, config: config ? config[propName] : undefined, isSortable: !!isSortable, name: propName, schema: properties[propName], setColumnFilters: setColumnFilters, setSortColumn: setSortColumn, setSortAsc: setSortAsc, sortAsc: sortColumn === propName ? sortAsc : undefined, style: style }));
    }, [
        columnFilters,
        columnNames,
        config,
        isSortable,
        properties,
        sortAsc,
        sortColumn,
    ]);
    const filteredRenderData = React.useMemo(() => {
        let result = renderData;
        if (!result) {
            return result;
        }
        if (searchQuery) {
            const lcQuery = searchQuery.toLowerCase();
            result = result.filter((item) => !!columnNames.find((columnName) => 
            // @ts-ignore
            `${item[columnName]}`.toLowerCase().includes(lcQuery)));
        }
        if (!columnFilters) {
            return result;
        }
        const columnFilterEntries = Object.entries(columnFilters);
        return result.filter((item) => columnFilterEntries.find(([columnName, columnFilterValue]) => 
        // @ts-ignore
        data[item._index][columnName] === columnFilterValue));
    }, [columnFilters, columnNames, data, renderData, searchQuery]);
    // Sort the filtered data
    const sortedRenderData = React.useMemo(() => {
        if (!sortColumn || !filteredRenderData) {
            return filteredRenderData;
        }
        const sortSchema = properties[sortColumn];
        const propConfig = config ? config[sortColumn] : undefined;
        const columnSort = propConfig === null || propConfig === void 0 ? void 0 : propConfig.sort;
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
            const sortByValue = (propConfig === null || propConfig === void 0 ? void 0 : propConfig.sortByValue) === undefined
                ? !sortSchema ||
                    sortSchema.type === "boolean" ||
                    sortSchema.type === "integer" ||
                    sortSchema.format === "date" ||
                    sortSchema.format === "date-time" ||
                    (propConfig === null || propConfig === void 0 ? void 0 : propConfig.renderCell)
                : propConfig.sortByValue;
            const x = sortByValue && data[a._index]
                ? // @ts-ignore
                    data[a._index][sortColumn]
                : a[sortColumn].toLowerCase();
            const y = sortByValue && data[b._index]
                ? // @ts-ignore
                    data[b._index][sortColumn]
                : b[sortColumn].toLowerCase();
            if (x === y) {
                return 0;
            }
            return (x < y ? 1 : -1) * (sortAsc ? -1 : 1);
        });
    }, [config, data, filteredRenderData, properties, sortAsc, sortColumn]);
    const onTdClick = React.useCallback((e) => {
        if (!sortedRenderData || !onRowClick) {
            return;
        }
        const { rowIndex } = e.currentTarget.dataset;
        if (!rowIndex) {
            return;
        }
        const row = sortedRenderData[parseInt(rowIndex, 10)];
        onRowClick(data[row._index], row._index, e);
    }, [data, onRowClick, sortedRenderData]);
    const Td = React.useCallback(({ columnIndex, rowIndex, style }) => {
        if (!sortedRenderData) {
            return null;
        }
        const propName = columnNames[columnIndex];
        const propConfig = config ? config[propName] : undefined;
        const row = sortedRenderData[rowIndex];
        const schema = properties[propName];
        const tdDivProps = {
            "data-row-index": rowIndex,
            "data-column-index": columnIndex,
            key: propName,
            style,
            onClick: !(propConfig === null || propConfig === void 0 ? void 0 : propConfig.renderCell) ? onTdClick : undefined,
            className: `schema-table__td schema-table__td--${rowIndex % 2 ? "odd" : "even"}${row && getRowSelected && getRowSelected(data[row._index])
                ? " schema-table__td--selected"
                : ""} ${row && getRowClassName
                ? getRowClassName(data[row._index], sortedRenderData)
                : ""}`,
        };
        if (propConfig === null || propConfig === void 0 ? void 0 : propConfig.renderCell) {
            return (_jsx("div", Object.assign({}, tdDivProps, { children: propConfig.renderCell(data[row._index], rowIndex) })));
        }
        if (!schema) {
            return null;
        }
        // @ts-ignore
        switch (schema.type) {
            case "boolean":
                tdDivProps.className += ` text-${(propConfig === null || propConfig === void 0 ? void 0 : propConfig.align) || "center"}`;
                break;
            case "number":
            case "integer":
                tdDivProps.className += ` text-${(propConfig === null || propConfig === void 0 ? void 0 : propConfig.align) || "end"}`;
                break;
            case "string":
                // @ts-ignore
                tdDivProps.title = row[propName];
                if (schema.format === "date" || schema.format === "date-time") {
                    tdDivProps.className += ` text-${(propConfig === null || propConfig === void 0 ? void 0 : propConfig.align) || "end"}`;
                }
        }
        return _jsx("div", Object.assign({}, tdDivProps, { children: row[propName] }));
    }, [
        sortedRenderData,
        columnNames,
        config,
        properties,
        onTdClick,
        getRowSelected,
        data,
        getRowClassName,
    ]);
    const onSearchChange = React.useCallback((e) => {
        setSearchQuery(e.currentTarget.value);
    }, []);
    const getRowHeight = React.useCallback(() => rowHeight, [rowHeight]);
    const width = dynamicWidthColumnCount ? gridWidth : fixedWidthColumnsWidth;
    const totalWidth = React.useMemo(() => columnWidths.reduce((a, b) => {
        return a + b;
    }, 0), [columnWidths]);
    return (_jsxs("div", Object.assign({ className: `schema-table${onRowClick ? " schema-table--clickable-rows" : ""}`, style: Object.assign(Object.assign({}, style), { width: dynamicWidthColumnCount ? gridWidth : fixedWidthColumnsWidth }) }, { children: [_jsx("div", Object.assign({ className: "tableTitle" }, { children: tableTitle })), _jsxs("div", Object.assign({ className: "form-action-container" }, { children: [_jsx("div", Object.assign({ className: "flex-1" }, { children: isSearchable ? (_jsx("input", { id: "input-filter", type: "text", placeholder: "Search...", value: searchQuery, onChange: onSearchChange, autoFocus: true })) : null })), customElement] })), _jsx(Heading, Object.assign({ height: 50, itemCount: columnCount, itemSize: getColumnWidth, layout: "horizontal", width: width, sortAsc: sortAsc, setSortAsc: setSortAsc, setSortColumn: setSortColumn, sortColumn: sortColumn, sortedRenderData: sortedRenderData }, { children: SchemaTableTh }), `thead_${width}_${sortColumn}_${sortAsc}_${searchQuery}`), _jsx(VariableSizeGrid, Object.assign({ className: "schema-table__tbody", height: props.height - (isSearchable ? 50 : 0), width: totalWidth, columnWidth: getColumnWidth, rowHeight: getRowHeight, columnCount: columnCount, rowCount: sortedRenderData ? sortedRenderData.length : 0 }, { children: Td }), `tbody_${width}_${sortColumn}_${sortAsc}_${searchQuery}_${columnCount}`)] })));
}
