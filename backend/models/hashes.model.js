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
    timestamps: false,
    indexes: [
      { name: 'idx_hashes_type_value', fields: ['hashType', 'hashValue'] }, //composite index
      { name: 'idx_hashes_type', fields: ['hashType'] },
      { name: 'idx_hashes_value', fields: ['hashValue'] },
      { name: 'idx_hashes_imageId', fields: ['imageId'] }
    ]
  });

  return Hash;
};