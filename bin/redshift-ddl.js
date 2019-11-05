#!/usr/bin/env node
/* eslint-disable no-console */

const program = require('commander');
const debug = require('debug');
const packJSON = require('../package.json');
const { loadDDL, processDDL, createClient } = require('../');

program
    .version(packJSON.version)
    .option('-v, --verbose', 'verbose debug output')
    .command('load')
    .description('load the ddl')
    .option('-c, --connection-string <connection>', 'connection string, defaults to PGCONNECTIONSTRING')
    .action(async (options) => {
        let conn = null;

        try {
            if (options.connectionString) {
                conn = createClient({
                    config: {
                        connectionString: options.connectionString
                    }
                });
                await conn.connect();
            }

            const ddlObject = await loadDDL({ conn });
            const processedDDL = await processDDL(ddlObject);
            console.log(JSON.stringify(processedDDL, null, 2));
            setTimeout(() => process.exit(0), 2000);
        } catch (err) {
            console.error(err.stack);
        }
    });

program.on('command:*', () => {
    console.error('Invalid command: %s', program.args.join(' '));
    console.error('See --help for a list of available commands.');
    process.exit(1);
});


program.parse(process.argv);

if (program.verbose) {
    debug.enable('*');
}
