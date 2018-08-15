const mysql = require('mysql');

// connection
const connection = mysql.createConnection({
    host: 'YOUR_SERVER_HOST',
    user: 'YOUR_USERNAME',
    password: 'YOUR_PASSWORD',
    database: 'YOUR_DB_NAME' // node
});

module.exports = connection;
