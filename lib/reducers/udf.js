const {
    UDF_RAW_KEYS
} = require('../constants');
const { convertKeys } = require('../helpers');

/**
 * @param {{ rows: UDFRawRow[] }} result
 * @returns {{ list: UDFRow[], map: UDFRowMap }}
 */
exports.udf = (result) => {
    /** @type UDFRow[] */
    const rows = result.rows.map(convertKeys.bind(null, UDF_RAW_KEYS));
    /** @type UDFRowMap */
    const map = new Map();

    for (const row of rows) {
        const key = `${row.schemaName}.${row.udfName}`;

        if (map.has(key)) {
            map.get(key).ddl += `\n${row.ddl}`;
        } else {
            map.set(key, {
                schemaName: row.schemaName,
                udfName: row.udfName,
                ddl: row.ddl
            });
        }
    }

    /** @type UDFRow[] */
    const list = [];

    for (const item of map.values()) {
        list.push(item);
    }

    return {
        list,
        map
    };
};
