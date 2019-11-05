const {
    TABLES_SORT_KEY_RAW_KEYS
} = require('../constants');
const { convertKeys } = require('../helpers');

/**
 * @param {{ rows: TablesSortKeysRawRow[] }} result
 * @returns {{ list: TablesSortKeysRow[], map: TablesSortKeysRowMap }}
 */
exports.tablesSortKeys = (result) => {
    /** @type TablesSortKeysProcessedRow[] */
    const rows = result.rows.map(convertKeys.bind(null, TABLES_SORT_KEY_RAW_KEYS));
    /** @type TablesSortKeysRowMap */
    const map = new Map();

    for (const row of rows) {
        const key = `${row.schemaName}.${row.tableName}`;

        if (map.has(key)) {
            map.get(key).sortFields.push(row.sortField);
        } else {
            map.set(key, {
                schemaName: row.schemaName,
                tableName: row.tableName,
                sortFields: [row.sortField]
            });
        }
    }

    /** @type TablesSortKeysRow[] */
    const list = [];

    for (const item of map.values()) {
        list.push(item);
    }

    return {
        list,
        map
    };
};
