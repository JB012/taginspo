const mysql = require('mysql2/promise');
const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, ".env")
});
const pool = mysql.createPool({
    connectionLimit : 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

module.exports = {pool}