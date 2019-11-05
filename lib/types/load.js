/** @typedef { import('pg').Client } Client */
/** @typedef { import('pg').Pool } Pool */

/**
 * @typedef LoadDDLOptions
 * @property {Client | Pool} [conn]
 * @property {boolean} [includeSchemas=true]
 * @property {boolean} [includeTables=true]
 * @property {boolean} [includeUDFs=true]
 * @property {boolean} [includeExternalTables=true]
 * @property {boolean} [includeViews=true]
 * @property {boolean} [includeViewDependencies=true]
 */

/**
 * @typedef LoadDDLResult
 * @property {string} databaseName
 * @property {SchemaNameRow[]} schemaList
 * @property {SchemaNameRowMap} schemaMap
 * @property {TableDDLRow[]} tableDDLsList
 * @property {TableDDLRowMap} tableDDLsMap
 * @property {TablesColumnsRow[]} tableColumnsList
 * @property {TablesColumnsRowMap} tableColumnsMap
 * @property {TablesSortKeysInterleavedRow[]} tableSortKeysInterleavedList
 * @property {TablesSortKeysInterleavedRowMap} tableSortKeysInterleavedMap
 * @property {TablesSortKeysRow[]} tableSortKeysList
 * @property {TablesSortKeysRowMap} tableSortKeysMap
 * @property {TablesDistStyleRow[]} tableDistStylesList
 * @property {TablesDistStyleRowMap} tableDistStylesMap
 * @property {TablesDistKeyRow[]} tableDistKeysList
 * @property {TablesDistKeyRowMap} tableDistKeysMap
 * @property {UDFRow[]} udfList
 * @property {UDFRowMap} udfMap
 * @property {ExternalTablesRow[]} externalTableList
 * @property {ExternalTablesRowMap} externalTableMap
 * @property {ViewRow[]} viewsList
 * @property {ViewRowMap} viewsMap
 * @property {ViewDependenciesRow[]} viewDependenciesList
 * @property {ViewDependenciesRowMap} viewDependenciesMap
 * @property {ViewSourcesRowMap} viewSourceMap
 */
