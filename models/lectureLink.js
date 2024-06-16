module.exports = (sequelize, DataTypes) => {
  const LectureLink = sequelize.define('LectureLink', {
    label: {
      type: DataTypes.STRING,
      allowNull: false
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Courses', // Name of the table
        key: 'id'
      }
    }
  });

  return LectureLink;
};
