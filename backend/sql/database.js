const pool = require('./connection.js');

async function getConnection() {
    return await pool.getConnection();
}

//!Export
module.exports = {
    getConnection
};
