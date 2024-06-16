// const { Sequelize, DataTypes } = require( 'sequelize' );
require( 'dotenv' ).config(); // Add this line to load .env variables
const bcrypt = require( 'bcrypt' );
const { Sequelize, DataTypes } = require( 'sequelize' );

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
      host: "localhost",
      dialect: "mysql",
    },
);

const User = require( './user' )( sequelize, DataTypes );
const Course = require( './course' )( sequelize, DataTypes );
const Enrollment = require( './enrollment' )( sequelize, DataTypes );
const LectureLink = require( './lectureLink' )( sequelize, DataTypes );
const LectureCompletion = require( './lectureCompletion' )( sequelize, DataTypes );

User.belongsToMany( Course, { through: Enrollment, foreignKey: 'userId' } );
Course.belongsToMany( User, { through: Enrollment, foreignKey: 'courseId' } );
Course.hasMany( LectureLink, { foreignKey: 'courseId' } );
Course.hasMany( Enrollment, { foreignKey: 'courseId' } );
Course.hasMany( LectureCompletion, { foreignKey: 'courseId' } );
LectureLink.hasMany( LectureCompletion, { foreignKey: 'lectureId' } );
LectureLink.belongsTo( Course, { foreignKey: 'courseId' } );
LectureCompletion.belongsTo( User, { foreignKey: 'userId' } );
LectureCompletion.belongsTo( Course, { foreignKey: 'courseId' } );
LectureCompletion.belongsTo( LectureLink, { foreignKey: 'lectureId' } );

async function createAdminUser() {
  try {
    const adminExists = await User.findOne( { where: { email: 'admin@example.com' } } );
    if (!adminExists) {
      const salt = await bcrypt.genSalt( 10 );
      const hashPassword = await bcrypt.hash( 'admin123', salt );
      await User.create( {
        name: 'Admin',
        email: 'admin@example.com',
        hashPassword,
        salt,
        contactNumber: '1234567890',
        role: "admin"
      } );
      console.log( 'Admin user created successfully!' );
    } else {
      console.log( 'Admin user already exists.' );
    }
  } catch (error) {
    console.error( 'Failed to create admin user:', error );
  }
}

module.exports = {
  User,
  Course,
  Enrollment,
  LectureLink,
  LectureCompletion,
  sequelize,
  createAdminUser
};
