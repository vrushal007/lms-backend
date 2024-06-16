module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define( 'User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    contactNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hashPassword: {
      type: DataTypes.STRING,
      allowNull: false
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    }
  } );
  return User;
}
