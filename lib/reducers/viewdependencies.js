/**
 * @param {{ rows: ViewDependenciesRawRow[] }} result
 * @returns {{ list: ViewDependenciesRow[], map: Map.<string, ViewDependenciesRow>, sourceMap: Map.<string, ViewSourcesRow> }}
 */
exports.viewDependencies = (result) => {
    /** @type Map<string, ViewDependenciesRow> */
    const map = new Map();
    /** @type Map<string, ViewSourcesRow> */
    const sourceMap = new Map();

    for (const row of result.rows) {
        const key = `${row.src_schemaname}.${row.src_objectname}`;
        const viewDependent = `${row.dependent_schemaname}.${row.dependent_objectname}`;
        const sourceInfo = {
            schemaName: row.src_schemaname,
            objectName: row.src_objectname,
            objectType: row.src_objectkind,
        };

        if (map.has(key)) {
            map.get(key).dependencies.push(viewDependent);
        } else {
            map.set(key, {
                ...sourceInfo,
                dependencies: [viewDependent]
            });
        }

        if (sourceMap.has(viewDependent)) {
            sourceMap.get(viewDependent).sources.push(sourceInfo);
        } else {
            sourceMap.set(viewDependent, {
                schemaName: row.dependent_schemaname,
                viewName: row.dependent_objectname,
                sources: [sourceInfo]
            });
        }
    }

    /** @type ViewDependenciesRow[] */
    const list = [];

    for (const item of map.values()) {
        list.push(item);
    }

    return {
        list,
        map,
        sourceMap
    };
};
