/**
 * Used to rename the given keys to their defined values. Note that this is
 * a shallow object alteration, the values are untouched.
 *
 * @example
 * // returns { camelCase: 'a value', untouched: 'number1' }
 * convertKeys({ camelcase: 'camelCase' }, { camelcase: 'a value', untouched: 'number1' })
 * @param {Object.<string, string>} keys - Key is the property name to rename to given value
 * @param {Object.<string, any>} row
 */
exports.convertKeys = (keys, row) => Object.fromEntries(
    Object.entries(row).map((entry) => {
        if (entry[0] in keys) {
            entry[0] = keys[entry[0]];
        }

        return entry;
    })
);
