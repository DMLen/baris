module.exports = (sequelize, Sequelize) => {
  const DataTypes = Sequelize.DataTypes || Sequelize;

  const Hash = sequelize.define("Hash", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    imageId: { type: DataTypes.INTEGER, allowNull: false }, //foreign key to Image model
    hashType: { type: DataTypes.STRING, allowNull: false },
    hashValue: { type: DataTypes.STRING, allowNull: false }
  }, {
    timestamps: false
  });

  return Hash;
};