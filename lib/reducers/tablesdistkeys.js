const {
    TABLES_DIST_KEY_RAW_KEYS
} = require('../constants');
const { convertKeys } = require('../helpers');

/**
 * @param {{ rows: TablesDistKeyRawRow[] }} result
 * @returns {{ list: TablesDistKeyRow[], map: TablesDistKeyRowMap }}
 */
exports.tablesDistKeys = (result) => {
    /** @type TablesDistKeyRow[] */
    const rows = result.rows.map(convertKeys.bind(this, TABLES_DIST_KEY_RAW_KEYS));

    return {
        list: rows,
        map: new Map(rows.map((row) => [`${row.schemaName}.${row.tableName}`, row]))
    };
};
