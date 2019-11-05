const {
    TABLES_SORT_KEY_INTERLEAVED_RAW_KEYS
} = require('../constants');
const { convertKeys } = require('../helpers');

/**
 * @param {{ rows: TablesSortKeysInterleavedRawRow[] }} result
 * @returns {{ list: TablesSortKeysInterleavedRow[], map: TablesSortKeysInterleavedRowMap }}
 */
exports.tablesSortKeysInterleaved = (result) => {
    /** @type TablesSortKeysInterleavedRow[] */
    const rows = result.rows.map(convertKeys.bind(null, TABLES_SORT_KEY_INTERLEAVED_RAW_KEYS));

    return {
        list: rows,
        map: new Map(rows.map((row) => [`${row.schemaName}.${row.tableName}`, row]))
    };
};
