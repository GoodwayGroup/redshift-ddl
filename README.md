# @goodwaygroup/redshift-ddl

<!--[![CircleCI](https://circleci.com/gh/GoodwayGroup/redshift-ddl.svg?style=svg)](https://circleci.com/gh/GoodwayGroup/redshift-ddl)-->

This module will query a Amazon Redshift database to produce information about it's DDL.

## CLI Usage

```bash
$ redshift-ddl load > /tmp/ddl.json

$ redshift-ddl load --connection-string=postgres://localhost:5439/thedb > /tmp/ddl.json

$ PGCONNECTIONSTRING=postgres://localhost:5439/thedb redshift-ddl load > /tmp/ddl.json
```

### CLI Help
```bash
$ redshift-ddl --help
Usage: redshift-ddl [options] [command]

Options:
  -V, --version   output the version number
  -v, --verbose   verbose debug output
  -h, --help      output usage information

Commands:
  load [options]  load the ddl

$ redshift-ddl load --help
Usage: redshift-ddl load [options]

load the ddl

Options:
  -c, --connection-string <connection>  connection string, defaults to PGCONNECTIONSTRING
  -h, --help                            output usage information
```

## Library Usage

```js
const { loadDDL, processDDL } = require('@goodwaygroup/redshift-ddl');

const loadedDDL = await loadDDL();
const processedDDL = await processDDL(loadedDDL);

console.log(processedDDL);
```

## Configuration Options

This module uses [pg](https://www.npmjs.com/package/pg) and by default you can use the environment variables it reads to config how the connection is made to Redshift.

### Connection Environment Variables

```
# Redshift connection information
PGHOST=localhost
PGUSER=process.env.USER
PGDATABASE=process.env.USER
PGPASSWORD=null
PGPORT=5439

# Redshift connection string (preferred if defined)
PGCONNECTIONSTRING=postgresql://dbuser:secretpassword@database.server.com:5439/mydb
```

### Existing Connection

If you already have a `pg.Pool` or `pg.Client` created, you can pass that to `loadDDL`.

```js
const ddl = await loadDDL({ conn: alreadyExistingConn });
```

### Make a new Connection with Explicit Configuration

This module exposes convenience methods to create instances of either `pg.Pool` or `pg.Client`.

```js
const { createClient, createPool } = require('@goodwaygroup/redshift-ddl');

// Client
const connClient = createClient({
    options: {
        statement_timeout: 15000
    }
});

// Pool
const connPool = createClient({
    options: {
        statement_timeout: 15000,
        connectionTimeoutMillis: 1000,
        max: 4
    }
});
```

#### Docs
* [`pg.Client`](https://node-postgres.com/api/client)
* [`pg.Pool`](https://node-postgres.com/api/pool)

## Processed DDL

Using `processDDL` with the result to `loadDDL` will produce a single object organized by schema. Each schema will contain all of it's tables, views, udfs, and external tables. This is the object returned by the command line tool from this module.

## Running Tests

To run tests, just run the following:

```
npm test
```

All commits are tested on [CircleCI](https://circleci.com/gh/GoodwayGroup/workflows/redshift-ddl)

## Linting

To run `eslint`:

```
npm run lint
```

To auto-resolve:

```
npm run lint:fix
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use milestones and `npm` version to bump versions. We also employ [auto-changelog](https://www.npmjs.com/package/auto-changelog) to manage the [CHANGELOG.md](CHANGELOG.md). For the versions available, see the [tags on this repository](https://github.com/GoodwayGroup/redshift-ddl/tags).

To initiate a version change:

```
npm version
```

## Authors

* **Julian Lannigan** - *Initial work* - [@mrlannigan](https://github.com/mrlannigan)

See also the list of [contributors](https://github.com/GoodwayGroup/redshift-ddl/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Sponsors

[![goodwaygroup][goodwaygroup]](https://goodwaygroup.com)

[goodwaygroup]: https://s3.amazonaws.com/gw-crs-assets/goodwaygroup/logos/ggLogo_sm.png "Goodway Group"