/**
 * @param {ExternalTablesDataRawRow} row
 * @returns {ExternalTablesRow}
 */
const externalTablesDataSingleRow = (row) => ({
    schemaName: row.schemaname,
    tableName: row.tablename,
    location: row.location,
    inputFormat: row.input_format,
    outputFormat: row.output_format,
    serializationLib: row.serialization_lib,
    serdeParameters: JSON.parse(row.serde_parameters),
    compressed: row.compressed === 1,
    parameters: JSON.parse(row.parameters),
    ddl: ''
});

/**
 * @param {{ rows: ExternalTablesDDLRawRow[] }} resultDDL
 * @param {{ rows: ExternalTablesDataRawRow[] }} resultData
 * @returns {{ list: ExternalTablesRow[], map: ExternalTablesRowMap }}
 */
exports.externalTables = (resultDDL, resultData) => {
    const list = resultData.rows.map(externalTablesDataSingleRow);
    const map = new Map(list.map((row) => [`${row.schemaName}.${row.tableName}`, row]));

    for (const row of resultDDL.rows) {
        map.get(`${row.schemaname}.${row.tablename}`).ddl += `\n${row.ddl}`;
    }

    return {
        list,
        map
    };
};
