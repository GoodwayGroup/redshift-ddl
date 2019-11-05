const {
    TABLE_DDL_RAW_KEYS,
} = require('../constants');
const { convertKeys } = require('../helpers');

/**
 * @param {{ rows: TableDDLRawRow[] }} result
 * @returns {{ list: TableDDLRow[], map: TableDDLRowMap }}
 */
exports.tableDDLs = (result) => {
    /** @type TableDDLRow[] */
    const rows = result.rows.map(convertKeys.bind(null, TABLE_DDL_RAW_KEYS));
    const map = new Map();

    for (const row of rows) {
        const key = `${row.schemaName}.${row.tableName}`;

        if (map.has(key)) {
            map.get(key).ddl += `\n${row.ddl}`;
        } else {
            map.set(key, {
                schemaName: row.schemaName,
                tableName: row.tableName,
                ddl: row.ddl
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
