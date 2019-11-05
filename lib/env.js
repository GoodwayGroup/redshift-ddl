require('dotenv').config();

exports.getConnectionString = () => process.env.PGCONNECTIONSTRING;
