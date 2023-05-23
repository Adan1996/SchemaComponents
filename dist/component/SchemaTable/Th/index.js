import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { camelTextToTitleText } from "../../../inc/string";
const Th = ({ columnFilters, config, isSortable, name, schema, setColumnFilters, setSortAsc, setSortColumn, sortAsc, style, }) => {
    const thDivProps = {
        style,
        className: `schema-table__th ${isSortable ? "schema-table__th--sortable" : "schema-table__th--unsortable"}`,
    };
    const onFilterButtonClick = React.useCallback((e) => {
        if (!setColumnFilters) {
            return;
        }
        if (columnFilters) {
            setColumnFilters(undefined);
            return;
        }
    }, [columnFilters, setColumnFilters]);
    const onSortButtonClick = React.useCallback(() => {
        if (sortAsc === undefined) {
            setSortColumn(name);
            setSortAsc(!(config === null || config === void 0 ? void 0 : config.defaultSortDesc));
            return;
        }
        setSortAsc((sortAsc) => !sortAsc);
    }, [config === null || config === void 0 ? void 0 : config.defaultSortDesc, name, setSortAsc, setSortColumn, sortAsc]);
    if (!schema) {
        return _jsx("div", Object.assign({}, thDivProps));
    }
    switch (schema.type) {
        case "boolean":
            thDivProps.className += ` text-${(config === null || config === void 0 ? void 0 : config.align) || "center"}`;
            break;
        case "integer":
        case "number":
            thDivProps.className += ` text-${(config === null || config === void 0 ? void 0 : config.align) || "end"}`;
            break;
        case "string":
            if (schema.format && ["date", "date-time"].indexOf(schema.format) >= 0) {
                thDivProps.className += ` text-${(config === null || config === void 0 ? void 0 : config.align) || "end"}`;
            }
    }
    return (_jsxs("div", Object.assign({}, thDivProps, { children: [isSortable ? (_jsxs("button", Object.assign({ className: "px-0", disabled: (config === null || config === void 0 ? void 0 : config.sortable) === false, onClick: onSortButtonClick }, { children: [(config === null || config === void 0 ? void 0 : config.title) || camelTextToTitleText(name), sortAsc === undefined ? null : sortAsc ? "▲" : "▼"] }))) : (_jsx("div", Object.assign({ style: { lineHeight: "44px" } }, { children: (config === null || config === void 0 ? void 0 : config.title) || camelTextToTitleText(name) }))), (config === null || config === void 0 ? void 0 : config.isFilterable) ? (_jsx("button", Object.assign({ onClick: onFilterButtonClick }, { children: _jsx("svg", Object.assign({ viewBox: "0 0 36 36", xmlns: "http://www.w3.org/2000/svg", height: 16, width: 16, style: { display: "block" } }, { children: _jsx("polygon", { fill: "#231F20", points: "14,30 22,25 22,17 35.999,0 17.988,0 0,0 14,17 " }) })) }))) : null] })));
};
export default React.memo(Th);
