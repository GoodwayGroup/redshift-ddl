const { VIEW_RAW_KEYS } = require('../constants');
const { convertKeys } = require('../helpers');

/**
 * @param {{ rows: ViewRawRow[] }} result
 * @returns {{ list: ViewRow[], map: ViewRowMap> }}
 */
exports.views = (result) => {
    /** @type ViewRow[] */
    const list = result.rows.map(convertKeys.bind(null, VIEW_RAW_KEYS));
    const map = new Map(list.map((row) => [`${row.schemaName}.${row.viewName}`, row]));

    return {
        list,
        map
    };
};
