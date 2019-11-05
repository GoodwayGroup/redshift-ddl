/**
 * @typedef ProcessedDDL
 * @property {string} databaseName
 * @property {Object.<string, ProcessedDDLSchema>} schemas
 */

/**
 * @typedef ProcessedDDLSchema
 * @property {Object.<string, ProcessedDDLTable>} tables
 * @property {Object.<string, ExternalTablesRow>} externalTables
 * @property {Object.<string, ProcessedDDLView>} views
 * @property {Object.<string, ProcessedDDLUDF} udfs
 */

/**
 * @typedef ProcessedDDLTable
 * @property {TablesColumn[]} columns
 * @property {string} distStyle
 * @property {string} distKey
 * @property {TablesSortKeyField[]} sortKeys
 * @property {boolean} isInterleaved
 * @property {string} ddl
 * @property {ViewDependent[]} viewDependencies
 */

/**
 * @typedef ProcessedDDLView
 * @property {string} ownerUsername
 * @property {string} ddl
 * @property {ProcessedDDLViewSource[]} sources
 * @property {ProcessedDDLViewDependency[]} dependencies
 */

/**
 * @typedef ProcessedDDLViewSource
 * @property {string} schemaName
 * @property {string} objectName
 * @property {ConstantRelKind} objectType
 */

/**
 * @typedef {string} ProcessedDDLViewDependency
 */

/**
 * @typedef ProcessedDDLUDF
 * @property {string} ddl
 */
