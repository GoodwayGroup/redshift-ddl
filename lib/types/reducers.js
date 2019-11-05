/**
 * @typedef DatabaseNameRawRow
 * @property {string} databasename
 */

/**
 * @typedef ExternalTablesDDLRawRow
 * @property {string} schemaname
 * @property {string} tablename
 * @property {string} ddl
 */

/**
 * @typedef ExternalTablesDataRawRow
 * @property {string} schemaname
 * @property {string} tablename
 * @property {string} location
 * @property {string} input_format
 * @property {string} output_format
 * @property {string} serialization_lib
 * @property {string} serde_parameters
 * @property {number} compressed
 * @property {string} parameters
 */

/**
 * @typedef ExternalTablesRow
 * @property {string} schemaName
 * @property {string} tableName
 * @property {string} location
 * @property {string} inputFormat
 * @property {string} outputFormat
 * @property {string} serializationLib
 * @property {Object} serdeParameters
 * @property {boolean} compressed
 * @property {Object} parameters
 * @property {string} ddl
 */

/**
 * @typedef {Map<string, ExternalTablesRow>} ExternalTablesRowMap
 */

/**
 * @typedef SchemaNameRawRow
 * @property {string} schemaname
 * @property {string} ownerusername
 * @property {string} ddl
 */

/**
 * @typedef SchemaNameRow
 * @property {string} schemaName
 * @property {string} ownerUsername
 * @property {string} ddl
 */

/**
 * @typedef {Map<string, SchemaNameRow>} SchemaNameRowMap
 */

/**
 * @typedef TableDDLRawRow
 * @property {string} schemaname
 * @property {string} tablename
 * @property {string} ddl
 */

/**
 * @typedef TableDDLRow
 * @property {string} schemaName
 * @property {string} tableName
 * @property {string} ddl
 */

/**
 * @typedef {Map<string, TableDDLRow>} TableDDLRowMap
 */

/**
 * @typedef TablesColumnsRawRow
 * @property {string} schemaname
 * @property {string} tablename
 * @property {string} col_name
 * @property {string} col_datatype
 * @property {string} col_encoding
 * @property {string} col_default
 * @property {boolean} col_nullable
 */

/**
 * @typedef TablesColumnsProcessedRow
 * @property {string} schemaName
 * @property {string} tableName
 * @property {string} col_name
 * @property {string} col_dataType
 * @property {string} col_encoding
 * @property {string} col_default
 * @property {boolean} col_nullable
 */

/**
 * @typedef TablesColumn
 * @property {string} name
 * @property {string} dataType
 * @property {string} encoding
 * @property {string} default
 * @property {boolean} nullable
 */

/**
 * @typedef TablesColumnsRow
 * @property {string} schemaName
 * @property {string} tableName
 * @property {TablesColumn[]} columns
 */

/**
 * @typedef {Map<string, TablesColumnsRow>} TablesColumnsRowMap
 */

/**
 * @typedef TablesDistKeyRawRow
 * @property {string} schemaname
 * @property {string} tablename
 * @property {string} distkey
 */

/**
 * @typedef TablesDistKeyRow
 * @property {string} schemaName
 * @property {string} tableName
 * @property {string} distKey
 */

/**
 * @typedef {Map<string, TablesDistKeyRow>} TablesDistKeyRowMap
 */

/**
 * @typedef TablesDistStyleRawRow
 * @property {string} schemaname
 * @property {string} tablename
 * @property {string} diststyle
 */

/**
 * @typedef TablesDistStyleRow
 * @property {string} schemaName
 * @property {string} tableName
 * @property {string} distStyle
 */

/**
 * @typedef {Map<string, TablesDistStyleRow>} TablesDistStyleRowMap
 */

/**
 * @typedef TablesSortKeysRawRow
 * @property {string} schemaname
 * @property {string} tablename
 * @property {string} sortfield
 */

/**
 * @typedef TablesSortKeysProcessedRow
 * @property {string} schemaName
 * @property {string} tableName
 * @property {string} sortField
 */

/**
 * @typedef {string} TablesSortKeyField
 */

/**
 * @typedef TablesSortKeysRow
 * @property {string} schemaName
 * @property {string} tableName
 * @property {TablesSortKeyField[]} sortFields
 */

/**
 * @typedef {Map<string, TablesSortKeysRow>} TablesSortKeysRowMap
 */

/**
 * @typedef TablesSortKeysInterleavedRawRow
 * @property {string} schemaname
 * @property {string} tablename
 * @property {boolean} is_interleaved
 */

/**
 * @typedef TablesSortKeysInterleavedRow
 * @property {string} schemaName
 * @property {string} tableName
 * @property {boolean} isInterleaved
 */

/**
 * @typedef {Map<string, TablesSortKeysInterleavedRow>} TablesSortKeysInterleavedRowMap
 */

/**
 * @typedef UDFRawRow
 * @property {string} schemaname
 * @property {string} udfname
 * @property {string} ddl
 */

/**
 * @typedef UDFRow
 * @property {string} schemaName
 * @property {string} udfName
 * @property {string} ddl
 */

/**
 * @typedef {Map<string, UDFRow>} UDFRowMap
 */

/**
 * @typedef ViewDependenciesRawRow
 * @property {string} src_oid
 * @property {string} src_schemaname
 * @property {string} src_objectname
 * @property {ConstantRelKind} src_objectkind
 * @property {string} dependent_viewoid
 * @property {string} dependent_schemaname
 * @property {string} dependent_objectname
 */

/**
 * @typedef {string} ViewDependent
 */

/**
 * @typedef ViewSource
 * @property {string} schemaName
 * @property {string} objectName
 * @property {ConstantRelKind} objectType
 */

/**
 * @typedef ViewDependenciesRow
 * @property {string} schemaName
 * @property {string} objectName
 * @property {ConstantRelKind} objectType
 * @property {ViewDependent[]} dependencies
 */

/**
 * @typedef {Map<string, ViewDependenciesRow>} ViewDependenciesRowMap
 */


/**
 * @typedef ViewSourcesRow
 * @property {string} schemaName
 * @property {string} viewName
 * @property {ViewSource[]} sources
 */

/**
 * @typedef {Map<string, ViewSourcesRow>} ViewSourcesRowMap
 */


/**
 * @typedef ViewRawRow
 * @property {string} schemaname
 * @property {string} viewname
 * @property {string} ownerusername
 * @property {string} ddl
 */

/**
 * @typedef ViewRow
 * @property {string} schemaName
 * @property {string} viewName
 * @property {string} ownerUsername
 * @property {string} ddl
 */

/**
 * @typedef {Map<string, ViewRow>} ViewRowMap
 */
