module.exports = (sequelize, DataTypes) => {
  const LectureCompletion = sequelize.define( 'LectureCompletion', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Courses',
        key: 'id'
      }
    },
    lectureId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'LectureLinks',
        key: 'id'
      }
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  } );

  return LectureCompletion;
};