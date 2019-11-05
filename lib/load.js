const debug = require('debug')('load');
const debugTables = require('debug')('load:tables');
const connection = require('./connection');
const reducers = require('./reducers');
const ddlQueries = require('./ddlqueries');

/**
 * Execute inspection queries against Redshift database
 *
 * @param {LoadDDLOptions?} options
 * @returns {Promise<LoadDDLResult>}
 */
exports.loadDDL = async ({
    conn = null,
    // TODO: implement conditional ddl loads
    // includeSchemas = true,
    // includeTables = true,
    // includeUDFs = true,
    // includeExternalTables = true,
    // includeViews = true,
    // includeViewDependencies = true
} = {}) => {
    let localConn = conn;
    if (!conn) {
        debug('Connecting to database...');
        localConn = connection.createClient();
        await localConn.connect();
        debug('Connected.');
    }

    // Get database name
    const resDatabaseName = await localConn.query(ddlQueries.databaseName());
    const databaseName = reducers.databaseName(resDatabaseName);
    debug('Database name = %s', databaseName);

    // Get Schemas
    const resSchemas = await localConn.query(ddlQueries.schemas());
    const { list: schemaList, map: schemaMap } = reducers.schemas(resSchemas);
    debug('Loaded %d schemas.', schemaList.length);

    // Load Tables
    const resTableDDLs = await localConn.query(ddlQueries.tableDDLs());
    const { list: tableDDLsList, map: tableDDLsMap } = reducers.tableDDLs(resTableDDLs);
    debugTables('Loaded %d table ddls.', tableDDLsList.length);

    const resTableColumns = await localConn.query(ddlQueries.tablesColumns());
    const { list: tableColumnsList, map: tableColumnsMap } = reducers.tablesColumns(resTableColumns);
    debugTables('Loaded %d columns.', resTableColumns.rows.length);

    const resTableDistStyles = await localConn.query(ddlQueries.tablesDistStyle());
    const { list: tableDistStylesList, map: tableDistStylesMap } = reducers.tablesDistStyle(resTableDistStyles);
    debugTables('Loaded %d dist styles.', tableDistStylesList.length);

    const resTableDistKeys = await localConn.query(ddlQueries.tablesDistKeys());
    const { list: tableDistKeysList, map: tableDistKeysMap } = reducers.tablesDistKeys(resTableDistKeys);
    debugTables('Loaded %d dist keys.', tableDistKeysList.length);

    const resTableSortKeysInterleaved = await localConn.query(ddlQueries.tablesSortKeysInterleaved());
    const { list: tableSortKeysInterleavedList, map: tableSortKeysInterleavedMap } = reducers.tablesSortKeysInterleaved(resTableSortKeysInterleaved);
    debugTables('Loaded %d sort keys interleaved.', tableSortKeysInterleavedList.length);

    const resTableSortKeys = await localConn.query(ddlQueries.tablesSortKeys());
    const { list: tableSortKeysList, map: tableSortKeysMap } = reducers.tablesSortKeys(resTableSortKeys);
    debugTables('Loaded %d sort keys.', tableSortKeysList.length);
    debug('Done loading tables.');

    // Load UDFs
    const resUDFs = await localConn.query(ddlQueries.udf());
    const { list: udfList, map: udfMap } = reducers.udf(resUDFs);
    debug('Loaded %d UDFs.', udfList.length);

    // Load External Tables
    const resExternalTables = await localConn.query(ddlQueries.externalTables());
    const resExternalTablesData = await localConn.query(ddlQueries.externalTablesData());
    const { list: externalTableList, map: externalTableMap } = reducers.externalTables(resExternalTables, resExternalTablesData);
    debug('Loaded %d external tables.', externalTableList.length);

    // Load Views
    const resViews = await localConn.query(ddlQueries.views());
    const { list: viewsList, map: viewsMap } = reducers.views(resViews);
    debug('Loaded %d views.', viewsList.length);

    // Load View Dependencies
    const resViewDependencies = await localConn.query(ddlQueries.viewDependencies());
    const { list: viewDependenciesList, map: viewDependenciesMap, sourceMap: viewSourceMap } = reducers.viewDependencies(resViewDependencies);
    debug('Loaded %d view dependencies.', viewDependenciesList.length);

    return {
        databaseName,
        schemaList,
        schemaMap,
        tableDDLsList,
        tableDDLsMap,
        tableColumnsList,
        tableColumnsMap,
        tableSortKeysInterleavedList,
        tableSortKeysInterleavedMap,
        tableSortKeysList,
        tableSortKeysMap,
        tableDistStylesList,
        tableDistStylesMap,
        tableDistKeysList,
        tableDistKeysMap,
        udfList,
        udfMap,
        externalTableList,
        externalTableMap,
        viewsList,
        viewsMap,
        viewDependenciesList,
        viewDependenciesMap,
        viewSourceMap,
    };
};
