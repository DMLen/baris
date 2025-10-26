const dbConfig = require("../config/db.config.js");
const { Sequelize } = require('@sequelize/core');
const sqlite3 = require('sqlite3');
 
const sequelize = new Sequelize({
   dialect: dbConfig.dialect,
   sqlite3Module: sqlite3,
   storage: dbConfig.storage,
   pool: dbConfig.pool,
   logging: false
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.images = require("./images.model.js")(sequelize, Sequelize);
db.hashes = require("./hashes.model.js")(sequelize, Sequelize);

db.images.hasMany(db.hashes, { foreignKey: 'imageId', as: 'hashes' });
db.hashes.belongsTo(db.images, { foreignKey: 'imageId', as: 'image' });


module.exports = db;