module.exports = (sequelize, DataTypes) => {
  return sequelize.define( 'Course', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.JSON,
      allowNull: false
    },
    instructorName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    totalDuration: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'Courses'
  } );
}
