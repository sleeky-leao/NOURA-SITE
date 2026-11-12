// Import PostgreSQL
const { Pool } = require("pg");

// Create database connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Export the connection
module.exports = pool;