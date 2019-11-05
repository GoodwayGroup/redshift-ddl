const { RELKIND } = require('./constants');

/**
 *
 * @param {LoadDDLResult} loadedDDL
 * @returns {ProcessedDDL}
 */
exports.processDDL = async (loadedDDL) => {
    /** @type ProcessedDDL */
    const out = {
        databaseName: loadedDDL.databaseName,
        schemas: {}
    };

    for (const schema of loadedDDL.schemaList) {
        out.schemas[schema.schemaName] = {
            tables: {},
            externalTables: {},
            views: {},
            udfs: {}
        };
    }

    /**
     * @param {string} schemaName
     * @returns {ProcessedDDLSchema}
     */
    const getSchema = (schemaName) => {
        if (!out.schemas[schemaName]) {
            out.schemas[schemaName] = {
                tables: {},
                externalTables: {},
                views: {},
                udfs: {}
            };
        }

        return out.schemas[schemaName];
    };

    /**
     * @param {string} schemaName
     * @param {string} tableName
     * @returns {ProcessedDDLTable}
     */
    const getTable = (schemaName, tableName) => {
        const schema = getSchema(schemaName);

        if (!schema.tables[tableName]) {
            schema.tables[tableName] = {};
        }

        return schema.tables[tableName];
    };

    /**
     * @param {string} schemaName
     * @param {string} viewName
     * @returns {ProcessedDDLView}
     */
    const getView = (schemaName, viewName) => {
        const schema = getSchema(schemaName);

        if (!schema.views[viewName]) {
            schema.views[viewName] = {};
        }

        return schema.views[viewName];
    };

    for (const tableColumns of loadedDDL.tableColumnsList) {
        const table = getTable(tableColumns.schemaName, tableColumns.tableName);

        table.columns = tableColumns.columns;
    }

    for (const tableDistStyle of loadedDDL.tableDistStylesList) {
        const table = getTable(tableDistStyle.schemaName, tableDistStyle.tableName);

        table.distStyle = tableDistStyle.distStyle;
    }

    for (const tableDistKey of loadedDDL.tableDistKeysList) {
        const table = getTable(tableDistKey.schemaName, tableDistKey.tableName);

        table.distKey = tableDistKey.distKey;
    }

    for (const tableSortKey of loadedDDL.tableSortKeysList) {
        const table = getTable(tableSortKey.schemaName, tableSortKey.tableName);

        table.sortKeys = tableSortKey.sortFields;
    }

    for (const tableSortKeysInterleaved of loadedDDL.tableSortKeysInterleavedList) {
        const table = getTable(tableSortKeysInterleaved.schemaName, tableSortKeysInterleaved.tableName);

        table.isInterleaved = tableSortKeysInterleaved.isInterleaved;
    }

    for (const tableDDL of loadedDDL.tableDDLsList) {
        const table = getTable(tableDDL.schemaName, tableDDL.tableName);

        table.ddl = tableDDL.ddl;
    }

    for (const loadedView of loadedDDL.viewsList) {
        const view = getView(loadedView.schemaName, loadedView.viewName);
        const viewKey = `${loadedView.schemaName}.${loadedView.viewName}`;

        view.ownerUsername = loadedView.ownerUsername;
        view.ddl = loadedView.ddl;
        if (loadedDDL.viewSourceMap.has(viewKey)) {
            view.sources = loadedDDL.viewSourceMap.get(viewKey).sources;
        } else {
            view.sources = [];
        }
    }

    for (const viewDependencies of loadedDDL.viewDependenciesList) {
        const { schemaName, objectName, objectType } = viewDependencies;

        if (objectType === RELKIND.TABLE) {
            const table = getTable(schemaName, objectName);
            table.viewDependencies = viewDependencies.dependencies;
        } else if (objectType === RELKIND.VIEW) {
            const view = getView(schemaName, objectName);
            view.dependencies = viewDependencies.dependencies;
        }
    }

    for (const externalTable of loadedDDL.externalTableList) {
        const schema = getSchema(externalTable.schemaName);

        schema.externalTables[externalTable.tableName] = externalTable;
    }

    for (const udf of loadedDDL.udfList) {
        const schema = getSchema(udf.schemaName);

        schema.udfs[udf.tableName] = {
            ddl: udf.ddl
        };
    }

    return out;
};
