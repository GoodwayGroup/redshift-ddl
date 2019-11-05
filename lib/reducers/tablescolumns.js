const {
    TABLES_COLUMNS_RAW_KEYS
} = require('../constants');
const { convertKeys } = require('../helpers');

/**
 * @param {{ rows: TablesColumnsRawRow[] }} result
 * @returns {{ list: TablesColumnsRow[], map: TablesColumnsRowMap }}
 */
exports.tablesColumns = (result) => {
    /** @type TablesColumnsProcessedRow[] */
    const rows = result.rows.map(convertKeys.bind(null, TABLES_COLUMNS_RAW_KEYS));
    const map = new Map();

    for (const row of rows) {
        const key = `${row.schemaName}.${row.tableName}`;

        /** @type TablesColumn */
        const column = {
            name: row.col_name,
            dataType: row.col_dataType,
            encoding: row.col_encoding,
            default: row.col_default,
            nullable: row.col_nullable
        };

        if (map.has(key)) {
            map.get(key).columns.push(column);
        } else {
            map.set(key, {
                schemaName: row.schemaName,
                tableName: row.tableName,
                columns: [column]
            });
        }
    }

    const list = [];

    for (const item of map.values()) {
        list.push(item);
    }

    return {
        list,
        map
    };
};
