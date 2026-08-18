require('dotenv').config();
const { Sequelize } = require('sequelize');
const { DB_NAME, DB_USERNAME, DB_HOST, DB_PASSWORD, DB_DIALECT, DB_PORT, DATABASE_URL } = require('../../constants');

// const sequelize = new Sequelize(
//   DB_NAME,
//   DB_USERNAME,
//   DB_PASSWORD,
//   {
//     host: DB_HOST,
//     port: DB_PORT || 5432,
//     dialect: DB_DIALECT || 'postgres',
//     logging: false,
//     dialectOptions: {
//       charset: 'utf8',
//       collate: 'utf8_unicode_ci',
//     },
//     define: {
//       charset: 'utf8',
//       collate: 'utf8_unicode_ci',
//     },
//     pool: {
//       max: 20,      // Maximum connections in pool (increased)
//       min: 2,       // Minimum connections (always keep some ready)
//       acquire: 60000, // Time (ms) to wait before throwing error (increased to 60s)
//       idle: 20000,    // Time (ms) a connection can be idle before released (increased)
//       evict: 5000,    // Time (ms) interval to check for evictable connections
//       handleDisconnects: true // Automatically handle disconnects
//     }
//   }
// );

// module.exports = sequelize;



const sequelize = DATABASE_URL
  ? new Sequelize(DATABASE_URL, {
      dialect: DB_DIALECT || "postgres",

      logging: false,

      dialectOptions: {
        ssl:
          process.env.NODE_ENV === "production"
            ? {
                require: true,
                rejectUnauthorized: false,
              }
            : false,
      },

      pool: {
        max: 20,
        min: 2,
        acquire: 60000,
        idle: 20000,
        evict: 5000,
      },
    })
  : new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
      host: DB_HOST,
      port: DB_PORT || 5432,
      dialect: DB_DIALECT || "postgres",

      logging: false,

      pool: {
        max: 20,
        min: 2,
        acquire: 60000,
        idle: 20000,
        evict: 5000,
      },
    });

module.exports = sequelize;