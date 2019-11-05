const get = require('lodash.get');

/**
 * Extract database name from first row
 *
 * @param {{ rows: DatabaseNameRawRow[] }} result
 * @returns {string} Database name
 */
exports.databaseName = (result) => get(result, ['rows', 0, 'databasename']);
