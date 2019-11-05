/** @enum {ConstantRelKind} */
exports.RELKIND = {
    TABLE: 'r',
    INDEX: 'i',
    SEQUENCE: 's',
    VIEW: 'v',
    MATERIALIZED_VIEW: 'm',
    COMPOSITE_TYPE: 'c',
    TOAST: 't',
    FOREIGN_TABLE: 'f'
};

exports.COMMON_RAW_KEYS = { schemaname: 'schemaName', tablename: 'tableName' };

exports.SCHEMA_RAW_KEYS = { schemaname: 'schemaName', ownerusername: 'ownerUsername' };

exports.TABLE_DDL_RAW_KEYS = exports.COMMON_RAW_KEYS;

exports.TABLES_COLUMNS_RAW_KEYS = {
    ...exports.COMMON_RAW_KEYS,
    col_datatype: 'col_dataType',
};

exports.TABLES_SORT_KEY_INTERLEAVED_RAW_KEYS = {
    ...exports.COMMON_RAW_KEYS,
    is_interleaved: 'isInterleaved',
};

exports.TABLES_SORT_KEY_RAW_KEYS = {
    ...exports.COMMON_RAW_KEYS,
    sortfield: 'sortField',
};

exports.TABLES_DIST_STYLE_RAW_KEYS = {
    ...exports.COMMON_RAW_KEYS,
    diststyle: 'distStyle',
};

exports.TABLES_DIST_KEY_RAW_KEYS = {
    ...exports.COMMON_RAW_KEYS,
    distkey: 'distKey',
};

exports.UDF_RAW_KEYS = {
    schemaname: 'schemaName',
    udfname: 'udfName'
};

exports.VIEW_RAW_KEYS = {
    schemaname: 'schemaName',
    viewname: 'udfName',
    ownerusername: 'ownerUsername'
};
