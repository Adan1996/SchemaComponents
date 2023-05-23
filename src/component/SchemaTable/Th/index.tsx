import { oas31 } from "openapi3-ts";
import React, { CSSProperties, Dispatch, SetStateAction } from "react";
import { IColumnConfig } from "../../../types/type";
import { camelTextToTitleText } from "../../../inc/string";

interface IThProps {
    columnFilters?: { [prop: string]: any };
    config?: IColumnConfig<any>;
    isSortable: boolean;
    name: string;
    schema: oas31.SchemaObject;
    setColumnFilters?: Dispatch<
        SetStateAction<{ [prop: string]: any } | undefined>
    >;
    setSortAsc: Dispatch<SetStateAction<boolean>>;
    setSortColumn: Dispatch<SetStateAction<string>>;
    sortAsc?: boolean;
    style: CSSProperties;
}

const Th = ({
                       columnFilters,
                       config,
                       isSortable,
                       name,
                       schema,
                       setColumnFilters,
                       setSortAsc,
                       setSortColumn,
                       sortAsc,
                       style,
                   }: IThProps) => {

    const thDivProps = {
        style,
        className: `schema-table__th ${
            isSortable ? "schema-table__th--sortable" : "schema-table__th--unsortable"
        }`,
    };

    const onFilterButtonClick = React.useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            if (!setColumnFilters) {
                return;
            }
            if (columnFilters) {
                setColumnFilters(undefined);
                return;
            }
        },
        [columnFilters, setColumnFilters]
    );

    const onSortButtonClick = React.useCallback(() => {
        if (sortAsc === undefined) {
            setSortColumn(name);
            setSortAsc(!config?.defaultSortDesc);
            return;
        }
        setSortAsc((sortAsc) => !sortAsc);
    }, [config?.defaultSortDesc, name, setSortAsc, setSortColumn, sortAsc]);

    if (!schema) {
        return <div {...thDivProps} />;
    }
    switch (schema.type) {
        case "boolean":
            thDivProps.className += ` text-${config?.align || "center"}`;
            break;
        case "integer":
        case "number":
            thDivProps.className += ` text-${config?.align || "end"}`;
            break;
        case "string":
            if (schema.format && ["date", "date-time"].indexOf(schema.format) >= 0) {
                thDivProps.className += ` text-${config?.align || "end"}`;
            }
    }

    return (
        <div {...thDivProps}>
            {isSortable ? (
                <button
                    className="px-0"
                    disabled={config?.sortable === false}
                    onClick={onSortButtonClick}
                >
                    {config?.title || camelTextToTitleText(name)}
                    {sortAsc === undefined ? null : sortAsc ? "▲" : "▼"}
                </button>
            ) : (
                <div style={{ lineHeight: "44px" }}>
                    {config?.title || camelTextToTitleText(name)}
                </div>
            )}
            {config?.isFilterable ? (
                <button onClick={onFilterButtonClick}>
                    <svg
                        viewBox="0 0 36 36"
                        xmlns="http://www.w3.org/2000/svg"
                        height={16}
                        width={16}
                        style={{ display: "block" }}
                    >
                        <polygon
                            fill="#231F20"
                            points="14,30 22,25 22,17 35.999,0 17.988,0 0,0 14,17 "
                        />
                    </svg>
                </button>
            ) : null}
        </div>
    );
};

export default React.memo(Th) as typeof Th;
