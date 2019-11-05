exports.schemas = () => `
    SELECT nspname         AS schemaname,
        pg_user.usename AS ownerusername,
        'CREATE SCHEMA ' + QUOTE_IDENT(nspname) +
        CASE
            WHEN nspowner > 100
                THEN ' AUTHORIZATION ' + QUOTE_IDENT(pg_user.usename)
            ELSE ''
            END
            + ';'          AS ddl
    FROM pg_catalog.pg_namespace as pg_namespace
            LEFT OUTER JOIN pg_catalog.pg_user pg_user
                            ON pg_namespace.nspowner = pg_user.usesysid
    WHERE nspowner >= 100
    ORDER BY nspname
`;

exports.views = () => `
    SELECT
        n.nspname AS schemaname
        ,c.relname AS viewname
        ,pg_user.usename AS ownerusername
        ,'--DROP VIEW ' + QUOTE_IDENT(n.nspname) + '.' + QUOTE_IDENT(c.relname) + ';\n'
        + CASE
            WHEN c.relnatts > 0 then 'CREATE OR REPLACE VIEW ' + QUOTE_IDENT(n.nspname) + '.' + QUOTE_IDENT(c.relname) + ' AS\n' + COALESCE(pg_get_viewdef(c.oid, TRUE), '')
            ELSE  COALESCE(pg_get_viewdef(c.oid, TRUE), '') END AS ddl
    FROM
        pg_catalog.pg_class AS c
    INNER JOIN
        pg_catalog.pg_namespace AS n
        ON c.relnamespace = n.oid
    LEFT OUTER JOIN pg_catalog.pg_user pg_user
    ON n.nspowner=pg_user.usesysid
    WHERE nspowner >= 100
    and relkind = 'v'
`;

exports.externalTablesData = () => `
    SELECT 
       schemaname,
       tablename,
       location,
       input_format,
       output_format,
       serialization_lib,
       serde_parameters,
       compressed,
       parameters
    FROM svv_external_tables
`;

// multi row ddl
exports.externalTables = () => String.raw`
    SELECT schemaname
         , tablename
         , seq
         , ddl
        FROM (
             SELECT 'CREATE EXTERNAL TABLE ' + quote_ident(schemaname) + '.' + quote_ident(tablename) + '('
                     + quote_ident(columnname) + ' ' + external_type AS ddl
                  , 0                                                AS seq
                  , schemaname
                  , tablename
                 FROM svv_external_columns
                 WHERE columnnum = 1
             UNION ALL
             SELECT ', ' + quote_ident(columnname) + ' '
                     + decode(external_type, 'double', 'double precision', external_type) AS ddl
                  , columnnum                                                             AS seq
                  , schemaname
                  , tablename
                 FROM svv_external_columns
                 WHERE columnnum > 1
                   AND part_key = 0
             UNION ALL
             SELECT ')'           AS ddl
                  , 100 + max_col AS seq
                  , schemaname
                  , tablename
                 FROM (
                      SELECT schemaname
                           , tablename
                           , max(columnnum) AS max_col
                          FROM svv_external_columns
                          WHERE part_key = 0
                          GROUP BY 1
                                 , 2
                      ) sub
             UNION ALL
             SELECT 'PARTITIONED BY (' + quote_ident(columnname) + ' ' + external_type AS ddl
                  , 100000 + part_key + columnnum                                      AS seq
                  , schemaname
                  , tablename
                 FROM svv_external_columns
                 WHERE part_key = 1

             UNION ALL
             SELECT ',' + quote_ident(columnname) + ' ' + external_type AS ddl
                  , 100000 + part_key + columnnum                       AS seq
                  , schemaname
                  , tablename
                 FROM svv_external_columns
                 WHERE part_key > 1
             UNION ALL
             SELECT ')'                 AS ddl
                  , 999999                                      AS seq
                  , schemaname
                  , tablename
                 FROM svv_external_columns
                 WHERE part_key = 1

             UNION ALL
             SELECT 'ROW FORMAT SERDE ' + quote_literal(serialization_lib)
                  , 1000000 AS seq
                  , schemaname
                  , tablename
                 FROM svv_external_tables
             UNION ALL
             SELECT 'WITH SERDEPROPERTIES ( ' + regexp_replace(
                     regexp_replace(regexp_replace(serde_parameters, '\\{|\\}', ''), '"', '\''), ':', '=') + ')' AS ddl
                  , 1000001                                                                                      AS seq
                  , schemaname
                  , tablename
                 FROM svv_external_tables
                 WHERE serde_parameters IS NOT NULL
             UNION ALL
             SELECT 'STORED AS INPUTFORMAT ' + quote_literal(input_format) + ' OUTPUTFORMAT '
                     + quote_literal(output_format)
                  , 1000001 AS seq
                  , schemaname
                  , tablename
                 FROM svv_external_tables
                 WHERE input_format IS NOT NULL
                   AND output_format IS NOT NULL
             UNION ALL
             SELECT 'LOCATION ' + quote_literal(location)
                  , 1000002 AS seq
                  , schemaname
                  , tablename
                 FROM svv_external_tables

             UNION ALL
             SELECT 'TABLE PROPERTIES (' + quote_literal(
                     regexp_replace(params, $$'EXTERNAL'='TRUE',|'transient_lastDdlTime'='[::digit::]*',$$, NULL))
                     + ')'  AS ddl
                  , 1000004 AS seq
                  , schemaname
                  , tablename
                 FROM (
                      SELECT schemaname
                           , tablename
                           , regexp_replace(regexp_replace(regexp_replace(parameters, '\\{|\\}', ''), '"', '\''), ':',
                                            '=') AS params
                          FROM svv_external_tables
                      ) tbl_params
                 WHERE params IS NOT NULL
             UNION ALL
             SELECT ';'        AS ddl
                  , 9999999999 AS seq
                  , schemaname
                  , tablename
                 FROM svv_external_tables
             ) gen
        WHERE ddl IS NOT NULL
        ORDER BY 1 DESC
               , 2 DESC
               , 3;
`;

// multi row ddl
exports.udf = () => String.raw`
    WITH arguments AS (
        SELECT 
            oid,
            i,
            arg_name[i]       AS argument_name,
            arg_types[i - 1]  AS argument_type
        FROM (
            SELECT
                generate_series(1, arg_count) AS i,
                arg_name,
                arg_types,
                oid
            FROM (
                SELECT
                    oid,
                    proargnames  AS arg_name,
                    proargtypes  AS arg_types,
                    pronargs     AS arg_count
                FROM pg_proc
                WHERE proowner != 1
            ) AS t
        ) AS t
    )
    SELECT schemaname,
        udfname,
        seq,
        trim(ddl) ddl
    FROM (
        SELECT n.nspname              AS schemaname,
                p.proname             AS udfname,
                p.oid                 AS udfoid,
                1000                  AS seq,
                ('CREATE OR REPLACE FUNCTION ' || QUOTE_IDENT(n.nspname) || '.' || QUOTE_IDENT(p.proname) ||
                ' \(')::varchar(max) AS ddl
        FROM pg_proc p
            LEFT JOIN pg_namespace n on n.oid = p.pronamespace
        WHERE p.proowner != 1
        UNION ALL
        SELECT n.nspname                                                                             AS schemaname,
                p.proname                                                                             AS udfname,
                p.oid                                                                                 AS udfoid,
                2000 + nvl(i, 0)                                                                      AS seq,
                case
                    when i = 1 then NVL(argument_name, '') || ' ' || format_type(argument_type, null)
                    else ',' || NVL(argument_name, '') || ' ' || format_type(argument_type, null) end AS ddl
        FROM pg_proc p
            LEFT JOIN pg_namespace n on n.oid = p.pronamespace
            LEFT JOIN arguments a on a.oid = p.oid
        WHERE p.proowner != 1
        UNION ALL
        SELECT n.nspname AS schemaname,
                p.proname AS udfname,
                p.oid     AS udfoid,
                3000      AS seq,
                '\)'      AS ddl
        FROM pg_proc p
            LEFT JOIN pg_namespace n on n.oid = p.pronamespace
        WHERE p.proowner != 1
        UNION ALL
        SELECT n.nspname                                                   AS schemaname,
                p.proname                                                  AS udfname,
                p.oid                                                      AS udfoid,
                4000                                                       AS seq,
                '  RETURNS ' || pg_catalog.format_type(p.prorettype, NULL) AS ddl
        FROM pg_proc p
            LEFT JOIN pg_namespace n on n.oid = p.pronamespace
        WHERE p.proowner != 1
        UNION ALL
        SELECT n.nspname       AS schemaname,
                p.proname       AS udfname,
                p.oid           AS udfoid,
                5000            AS seq,
                CASE
                    WHEN p.provolatile = 'v' THEN 'VOLATILE'
                    WHEN p.provolatile = 's' THEN 'STABLE'
                    WHEN p.provolatile = 'i' THEN 'IMMUTABLE'
                    ELSE '' END as ddl
        FROM pg_proc p
            LEFT JOIN pg_namespace n on n.oid = p.pronamespace
        WHERE p.proowner != 1
        UNION ALL
        SELECT n.nspname AS schemaname,
                p.proname AS udfname,
                p.oid     AS udfoid,
                6000      AS seq,
                'AS $$'   AS ddl
        FROM pg_proc p
            LEFT JOIN pg_namespace n on n.oid = p.pronamespace
        WHERE p.proowner != 1
        UNION ALL
        SELECT n.nspname AS schemaname,
                p.proname AS udfname,
                p.oid     AS udfoid,
                7000      AS seq,
                p.prosrc  AS DDL
        FROM pg_proc p
            LEFT JOIN pg_namespace n on n.oid = p.pronamespace
        WHERE p.proowner != 1
        UNION ALL
        SELECT n.nspname                            AS schemaname,
                p.proname                           AS udfname,
                p.oid                               AS udfoid,
                8000                                AS seq,
                '$$ LANGUAGE ' + lang.lanname + ';' AS ddl
        FROM pg_proc p
            LEFT JOIN pg_namespace n on n.oid = p.pronamespace
            LEFT JOIN (select oid, lanname FROM pg_language) lang on p.prolang = lang.oid
        WHERE p.proowner != 1
    )
    ORDER BY udfoid, seq
`;

exports.viewDependencies = () => `
    SELECT DISTINCT
        srcobj.oid AS src_oid
        ,srcnsp.nspname AS src_schemaname
        ,srcobj.relname AS src_objectname
        ,srcobj.relkind AS src_objectkind
        ,tgtobj.oid AS dependent_viewoid
        ,tgtnsp.nspname AS dependent_schemaname
        ,tgtobj.relname AS dependent_objectname
    FROM
        pg_catalog.pg_class AS srcobj
    INNER JOIN
        pg_catalog.pg_depend AS srcdep
            ON srcobj.oid = srcdep.refobjid
    INNER JOIN
        pg_catalog.pg_depend AS tgtdep
            ON srcdep.objid = tgtdep.objid
    JOIN
        pg_catalog.pg_class AS tgtobj
            ON tgtdep.refobjid = tgtobj.oid
            AND srcobj.oid <> tgtobj.oid
    LEFT OUTER JOIN
        pg_catalog.pg_namespace AS srcnsp
            ON srcobj.relnamespace = srcnsp.oid
    LEFT OUTER JOIN
        pg_catalog.pg_namespace tgtnsp
            ON tgtobj.relnamespace = tgtnsp.oid
    WHERE tgtdep.deptype = 'i'
    AND tgtobj.relkind = 'v'
`;

exports.tablesSortKeysInterleaved = () => `
    SELECT table_id,
        schemaname,
        tablename,
        CASE WHEN min_sort < 0 THEN TRUE ELSE FALSE END AS is_interleaved
    FROM (
        SELECT c.oid::bigint as   table_id
            , n.nspname     AS   schemaname
            , c.relname     AS   tablename
            , min(attsortkeyord) min_sort
        FROM pg_namespace AS n
                INNER JOIN pg_class AS c ON n.oid = c.relnamespace
                INNER JOIN pg_attribute AS a ON c.oid = a.attrelid
        WHERE c.relkind = 'r'
        AND abs(a.attsortkeyord) > 0
        AND a.attnum > 0
        group by 1, 2, 3
    )
`;

exports.tablesSortKeys = () => `
    SELECT c.oid::bigint       AS table_id
        , n.nspname            AS schemaname
        , c.relname            AS tablename
        , abs(a.attsortkeyord) AS seq
        , a.attname            as sortfield
    FROM pg_namespace AS n
            INNER JOIN pg_class AS c ON n.oid = c.relnamespace
            INNER JOIN pg_attribute AS a ON c.oid = a.attrelid
    WHERE c.relkind = 'r'
    AND abs(a.attsortkeyord) > 0
    AND a.attnum > 0
    ORDER BY schemaname asc, tablename asc, seq asc
`;

exports.tablesDistStyle = () => `
    SELECT c.oid::bigint as table_id
        , n.nspname     AS schemaname
        , c.relname     AS tablename
        , CASE
            WHEN c.reldiststyle = 0 THEN 'EVEN'
            WHEN c.reldiststyle = 1 THEN 'KEY'
            WHEN c.reldiststyle = 8 THEN 'ALL'
            WHEN c.reldiststyle = 9 THEN 'AUTO'
            ELSE 'UNKNOWN'
        END              AS "diststyle"
    FROM pg_namespace AS n
            INNER JOIN pg_class AS c ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'
`;

exports.tablesDistKeys = () => `
    SELECT c.oid::bigint         AS table_id
        , n.nspname              AS schemaname
        , c.relname              AS tablename
        , QUOTE_IDENT(a.attname) AS distkey
    FROM pg_namespace AS n
            INNER JOIN pg_class AS c ON n.oid = c.relnamespace
            INNER JOIN pg_attribute AS a ON c.oid = a.attrelid
    WHERE c.relkind = 'r'
    AND a.attisdistkey IS TRUE
    AND a.attnum > 0
`;

exports.tablesColumns = () => `
    SELECT c.oid::bigint                                            AS table_id
        , n.nspname                                                 AS schemaname
        , c.relname                                                 AS tablename
        , a.attnum                                                  AS seq
        , a.attname                                                 AS col_name
        , CASE
            WHEN STRPOS(UPPER(format_type(a.atttypid, a.atttypmod)), 'CHARACTER VARYING') > 0
                THEN REPLACE(UPPER(format_type(a.atttypid, a.atttypmod)), 'CHARACTER VARYING', 'VARCHAR')
            WHEN STRPOS(UPPER(format_type(a.atttypid, a.atttypmod)), 'CHARACTER') > 0
                THEN REPLACE(UPPER(format_type(a.atttypid, a.atttypmod)), 'CHARACTER', 'CHAR')
            ELSE UPPER(format_type(a.atttypid, a.atttypmod))
        END                                                         AS col_datatype
        , CASE
            WHEN format_encoding((a.attencodingtype)::integer) = 'none'
                THEN 'RAW'
            ELSE format_encoding((a.attencodingtype)::integer)
        END                                                         AS col_encoding
        , CASE WHEN a.atthasdef IS TRUE THEN adef.adsrc ELSE '' END AS col_default
        , a.attnotnull                                              AS col_nullable
    FROM pg_namespace AS n
            INNER JOIN pg_class AS c ON n.oid = c.relnamespace
            INNER JOIN pg_attribute AS a ON c.oid = a.attrelid
            LEFT OUTER JOIN pg_attrdef AS adef ON a.attrelid = adef.adrelid AND a.attnum = adef.adnum
    WHERE c.relkind = 'r'
    AND a.attnum > 0
    ORDER BY n.nspname, c.relname, a.attnum
`;

exports.tableDDLs = () => `
    SELECT table_id
        , REGEXP_REPLACE(schemaname, '^zzzzzzzz', '') AS schemaname
        , REGEXP_REPLACE(tablename, '^zzzzzzzz', '')  AS tablename
        , seq
        , ddl
    FROM (
        SELECT table_id
            , schemaname
            , tablename
            , seq
            , ddl
        FROM (
                --DROP TABLE
                SELECT c.oid::bigint                                                                AS table_id
                    , n.nspname                                                                     AS schemaname
                    , c.relname                                                                     AS tablename
                    , 0                                                                             AS seq
                    , '--DROP TABLE ' + QUOTE_IDENT(n.nspname) + '.' + QUOTE_IDENT(c.relname) + ';' AS ddl
                FROM pg_namespace AS n
                        INNER JOIN pg_class AS c ON n.oid = c.relnamespace
                WHERE c.relkind = 'r'
                        --CREATE TABLE
                UNION
                SELECT c.oid::bigint                                                                             AS table_id
                    , n.nspname                                                                                  AS schemaname
                    , c.relname                                                                                  AS tablename
                    , 2                                                                                          AS seq
                    , 'CREATE TABLE IF NOT EXISTS ' + QUOTE_IDENT(n.nspname) + '.' + QUOTE_IDENT(c.relname) +
                        ''                                                                                       AS ddl
                FROM pg_namespace AS n
                        INNER JOIN pg_class AS c ON n.oid = c.relnamespace
                WHERE c.relkind = 'r'
                        --OPEN PAREN COLUMN LIST
                UNION
                SELECT c.oid::bigint as table_id,
                        n.nspname     AS schemaname,
                        c.relname     AS tablename,
                        5             AS seq,
                        '('           AS ddl
                FROM pg_namespace AS n
                        INNER JOIN pg_class AS c ON n.oid = c.relnamespace
                WHERE c.relkind = 'r'
                        --COLUMN LIST
                UNION
                SELECT table_id
                    , schemaname
                    , tablename
                    , seq
                    , '\t' + col_delim + col_name + ' ' + col_datatype + ' ' + col_nullable + ' ' + col_default +
                        ' ' + col_encoding AS ddl
                FROM (
                        SELECT c.oid::bigint                                                             AS table_id
                                , n.nspname                                                              AS schemaname
                                , c.relname                                                              AS tablename
                                , 100000000 + a.attnum                                                   AS seq
                                , CASE WHEN a.attnum > 1 THEN ',' ELSE '' END                            AS col_delim
                                , QUOTE_IDENT(a.attname)                                                 AS col_name
                                , CASE
                                    WHEN STRPOS(UPPER(format_type(a.atttypid, a.atttypmod)), 'CHARACTER VARYING') > 0
                                        THEN REPLACE(UPPER(format_type(a.atttypid, a.atttypmod)), 'CHARACTER VARYING',
                                                    'VARCHAR')
                                    WHEN STRPOS(UPPER(format_type(a.atttypid, a.atttypmod)), 'CHARACTER') > 0
                                        THEN REPLACE(UPPER(format_type(a.atttypid, a.atttypmod)), 'CHARACTER', 'CHAR')
                                    ELSE UPPER(format_type(a.atttypid, a.atttypmod))
                            END                                                                          AS col_datatype
                                , CASE
                                    WHEN format_encoding((a.attencodingtype)::integer) = 'none'
                                        THEN 'ENCODE RAW'
                                    ELSE 'ENCODE ' + format_encoding((a.attencodingtype)::integer)
                            END                                                                          AS col_encoding
                                , CASE WHEN a.atthasdef IS TRUE THEN 'DEFAULT ' + adef.adsrc ELSE '' END AS col_default
                                , CASE WHEN a.attnotnull IS TRUE THEN 'NOT NULL' ELSE '' END             AS col_nullable
                        FROM pg_namespace AS n
                                    INNER JOIN pg_class AS c ON n.oid = c.relnamespace
                                    INNER JOIN pg_attribute AS a ON c.oid = a.attrelid
                                    LEFT OUTER JOIN pg_attrdef AS adef
                                                    ON a.attrelid = adef.adrelid AND a.attnum = adef.adnum
                        WHERE c.relkind = 'r'
                            AND a.attnum > 0
                        ORDER BY a.attnum
                    )
                    --CONSTRAINT LIST
                UNION
                (SELECT c.oid::bigint                           AS table_id
                        , n.nspname                             AS schemaname
                        , c.relname                             AS tablename
                        , 200000000 + CAST(con.oid AS INT)      AS seq
                        , '\t,' + pg_get_constraintdef(con.oid) AS ddl
                FROM pg_constraint AS con
                            INNER JOIN pg_class AS c ON c.relnamespace = con.connamespace AND c.oid = con.conrelid
                            INNER JOIN pg_namespace AS n ON n.oid = c.relnamespace
                WHERE c.relkind = 'r'
                    AND pg_get_constraintdef(con.oid) NOT LIKE 'FOREIGN KEY%'
                ORDER BY seq)
                --CLOSE PAREN COLUMN LIST
                UNION
                SELECT c.oid::bigint as table_id,
                        n.nspname     AS schemaname,
                        c.relname     AS tablename,
                        299999999     AS seq,
                        ')'           AS ddl
                FROM pg_namespace AS n
                        INNER JOIN pg_class AS c ON n.oid = c.relnamespace
                WHERE c.relkind = 'r'
                        --BACKUP
                UNION
                SELECT c.oid::bigint as table_id
                    , n.nspname     AS schemaname
                    , c.relname     AS tablename
                    , 300000000     AS seq
                    , 'BACKUP NO'   as ddl
                FROM pg_namespace AS n
                        INNER JOIN pg_class AS c ON n.oid = c.relnamespace
                        INNER JOIN (SELECT SPLIT_PART(key, '_', 5) id
                                    FROM pg_conf
                                    WHERE key LIKE 'pg_class_backup_%'
                                        AND SPLIT_PART(key, '_', 4) = (SELECT oid
                                                                        FROM pg_database
                                                                        WHERE datname = current_database())) t
                                    ON t.id = c.oid
                WHERE c.relkind = 'r'
                        --BACKUP WARNING
                UNION
                SELECT c.oid::bigint                                                                as table_id
                    , n.nspname                                                                    AS schemaname
                    , c.relname                                                                    AS tablename
                    , 1                                                                            AS seq
                    , '--WARNING: This DDL inherited the BACKUP NO property from the source table' as ddl
                FROM pg_namespace AS n
                        INNER JOIN pg_class AS c ON n.oid = c.relnamespace
                        INNER JOIN (SELECT SPLIT_PART(key, '_', 5) id
                                    FROM pg_conf
                                    WHERE key LIKE 'pg_class_backup_%'
                                        AND SPLIT_PART(key, '_', 4) = (SELECT oid
                                                                        FROM pg_database
                                                                        WHERE datname = current_database())) t
                                    ON t.id = c.oid
                WHERE c.relkind = 'r'
                        --DISTSTYLE
                UNION
                SELECT c.oid::bigint as table_id
                    , n.nspname     AS schemaname
                    , c.relname     AS tablename
                    , 300000001     AS seq
                    , CASE
                            WHEN c.reldiststyle = 0 THEN 'DISTSTYLE EVEN'
                            WHEN c.reldiststyle = 1 THEN 'DISTSTYLE KEY'
                            WHEN c.reldiststyle = 8 THEN 'DISTSTYLE ALL'
                            WHEN c.reldiststyle = 9 THEN 'DISTSTYLE AUTO'
                            ELSE '<<Error - UNKNOWN DISTSTYLE>>'
                    END              AS ddl
                FROM pg_namespace AS n
                        INNER JOIN pg_class AS c ON n.oid = c.relnamespace
                WHERE c.relkind = 'r'
                        --DISTKEY COLUMNS
                UNION
                SELECT c.oid::bigint                               as table_id
                    , n.nspname                                   AS schemaname
                    , c.relname                                   AS tablename
                    , 400000000 + a.attnum                        AS seq
                    , ' DISTKEY (' + QUOTE_IDENT(a.attname) + ')' AS ddl
                FROM pg_namespace AS n
                        INNER JOIN pg_class AS c ON n.oid = c.relnamespace
                        INNER JOIN pg_attribute AS a ON c.oid = a.attrelid
                WHERE c.relkind = 'r'
                    AND a.attisdistkey IS TRUE
                    AND a.attnum > 0
                    --SORTKEY COLUMNS
                UNION
                select table_id,
                        schemaname,
                        tablename,
                        seq,
                        case when min_sort < 0 then 'INTERLEAVED SORTKEY (' else ' SORTKEY (' end as ddl
                from (SELECT c.oid::bigint as   table_id
                            , n.nspname     AS   schemaname
                            , c.relname     AS   tablename
                            , 499999999     AS   seq
                            , min(attsortkeyord) min_sort
                        FROM pg_namespace AS n
                                INNER JOIN pg_class AS c ON n.oid = c.relnamespace
                                INNER JOIN pg_attribute AS a ON c.oid = a.attrelid
                        WHERE c.relkind = 'r'
                        AND abs(a.attsortkeyord) > 0
                        AND a.attnum > 0
                        group by 1, 2, 3, 4)
                UNION
                (SELECT c.oid::bigint                    as table_id
                        , n.nspname                        AS schemaname
                        , c.relname                        AS tablename
                        , 500000000 + abs(a.attsortkeyord) AS seq
                        , CASE
                            WHEN abs(a.attsortkeyord) = 1
                                THEN '\t' + QUOTE_IDENT(a.attname)
                            ELSE '\t, ' + QUOTE_IDENT(a.attname)
                        END                              AS ddl
                FROM pg_namespace AS n
                            INNER JOIN pg_class AS c ON n.oid = c.relnamespace
                            INNER JOIN pg_attribute AS a ON c.oid = a.attrelid
                WHERE c.relkind = 'r'
                    AND abs(a.attsortkeyord) > 0
                    AND a.attnum > 0
                ORDER BY abs(a.attsortkeyord))
                UNION
                SELECT c.oid::bigint as table_id
                    , n.nspname     AS schemaname
                    , c.relname     AS tablename
                    , 599999999     AS seq
                    , '\t)'         AS ddl
                FROM pg_namespace AS n
                        INNER JOIN pg_class AS c ON n.oid = c.relnamespace
                        INNER JOIN pg_attribute AS a ON c.oid = a.attrelid
                WHERE c.relkind = 'r'
                    AND abs(a.attsortkeyord) > 0
                    AND a.attnum > 0
                    --END SEMICOLON
                UNION
                SELECT c.oid::bigint as table_id,
                        n.nspname     AS schemaname,
                        c.relname     AS tablename,
                        600000000     AS seq,
                        ';'           AS ddl
                FROM pg_namespace AS n
                        INNER JOIN pg_class AS c ON n.oid = c.relnamespace
                WHERE c.relkind = 'r'

                UNION
                --TABLE OWNERSHIP AS AN ALTER TABLE STATMENT
                SELECT c.oid::bigint                as table_id,
                        n.nspname                    AS schemaname,
                        c.relname                    AS tablename,
                        600500000                    AS seq,
                        'ALTER TABLE ' + QUOTE_IDENT(n.nspname) + '.' + QUOTE_IDENT(c.relname) + ' owner to ' +
                        QUOTE_IDENT(u.usename) + ';' AS ddl
                FROM pg_namespace AS n
                        INNER JOIN pg_class AS c ON n.oid = c.relnamespace
                        INNER JOIN pg_user AS u ON c.relowner = u.usesysid
                WHERE c.relkind = 'r'
            )
        UNION
        (
            SELECT c.oid::bigint                                      as table_id,
                    'zzzzzzzz' || n.nspname                            AS schemaname,
                    'zzzzzzzz' || c.relname                            AS tablename,
                    700000000 + CAST(con.oid AS INT)                   AS seq,
                    'ALTER TABLE ' + QUOTE_IDENT(n.nspname) + '.' + QUOTE_IDENT(c.relname) + ' ADD ' +
                    pg_get_constraintdef(con.oid)::VARCHAR(1024) + ';' AS ddl
            FROM pg_constraint AS con
                    INNER JOIN pg_class AS c
                                ON c.relnamespace = con.connamespace
                                    AND c.oid = con.conrelid
                    INNER JOIN pg_namespace AS n ON n.oid = c.relnamespace
            WHERE c.relkind = 'r'
            AND con.contype = 'f'
            ORDER BY seq
        )
        ORDER BY table_id, schemaname, tablename, seq
    )
`;

exports.databaseName = () => 'SELECT current_database() as databasename';
