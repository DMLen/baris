module.exports = {
    HOST: "db",
    USER: "baris",
    PASSWORD: "baris",
    DB: "sqlite",
    dialect: "sqlite",
    storage: "sequelize.sqlite",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
};