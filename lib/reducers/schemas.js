const {
    SCHEMA_RAW_KEYS
} = require('../constants');
const { convertKeys } = require('../helpers');

/**
 * @param {{ rows: SchemaNameRawRow[] }} result
 * @returns {{ list: SchemaNameRow[], map: SchemaNameRowMap }}
 */
exports.schemas = (result) => {
    /** @type SchemaNameRow[] */
    const rows = result.rows.map(convertKeys.bind(null, SCHEMA_RAW_KEYS));

    return {
        list: rows,
        map: new Map(rows.map((row) => [row.schemaName, row]))
    };
};
