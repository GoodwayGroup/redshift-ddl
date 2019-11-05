const {
    TABLES_DIST_STYLE_RAW_KEYS,
} = require('../constants');
const { convertKeys } = require('../helpers');

/**
 * @param {{ rows: TablesDistStyleRawRow[] }} result
 * @returns {{ list: TablesDistStyleRow[], map: TablesDistStyleRowMap }}
 */
exports.tablesDistStyle = (result) => {
    /** @type TablesDistStyleRow[] */
    const rows = result.rows.map(convertKeys.bind(this, TABLES_DIST_STYLE_RAW_KEYS));

    return {
        list: rows,
        map: new Map(rows.map((row) => [`${row.schemaName}.${row.tableName}`, row]))
    };
};
