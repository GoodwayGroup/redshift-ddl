const pg = require('pg');
const { getConnectionString } = require('./env');

exports.getConnectionConfigObject = () => {
    const connectionString = getConnectionString();

    if (connectionString) {
        return { connectionString };
    }

    return {};
};

exports.createClient = ({ Client = pg.Client, config = {} } = {}) => new Client({
    ...exports.getConnectionConfigObject(),
    ...config
});

exports.createPool = ({ Pool = pg.Pool, config = {} } = {}) => new Pool({
    ...exports.getConnectionConfigObject(),
    ...config
});
