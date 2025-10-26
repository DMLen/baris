module.exports = (sequelize, Sequelize) => {
  const DataTypes = Sequelize.DataTypes || Sequelize;

  const Image = sequelize.define("Image", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    thumbnailPath: { type: DataTypes.STRING, allowNull: false },
    width: { type: DataTypes.INTEGER, allowNull: false },
    height: { type: DataTypes.INTEGER, allowNull: false },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    origin: { type: DataTypes.STRING, allowNull: true },
  }, {
    timestamps: false
  });

  return Image;
}