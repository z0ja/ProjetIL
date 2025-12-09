const { Pool } = require('pg');

const pool = new Pool({
    user: 'uapv2402499',
    host: 'pedago.univ-avignon.fr',
    database: 'etd',
    password: 'tWKO5X',
    port: 5432,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};