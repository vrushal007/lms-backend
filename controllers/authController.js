const bcrypt = require( 'bcrypt' );
const jwt = require( 'jsonwebtoken' );
const { User } = require( '../models' );
require( 'dotenv' ).config();
const transporter = require( "../config/nodemailer" )

const signup = async (req, res) => {

  const { email, contactNumber, name, password } = req.body;
  try {

    const existingUser = await User.findOne( { where: { email } } );
    if (existingUser) {
      return res.status( 400 ).json( {
        success: false,
        data: null,
        message: 'User Already exists'
      } );
    }

    const salt = await bcrypt.genSalt( 10 );
    const hashPassword = await bcrypt.hash( password, salt );
    const user = await User.create( {
      email,
      contactNumber,
      name,
      hashPassword,
      salt,
      role: "user"
    } );

    // Send a confirmation email
    const mailOptions = {
      to: email, // list of receivers
      subject: 'Welcome to Our Online Learning Platform!', // Subject line
      html: `<b>Hi ${name}</b>,<br>Welcome to our platform! We are excited to have you on board and start your learning journey with us.` // html body,
    };

    // Send email
    transporter.sendMail( mailOptions, function (err, info) {
      if (err) {
        console.log( err );
        return res.status( 500 ).json( {
          success: false,
          message: 'User created, but failed to send welcome email.'
        } );
      } else {
        console.log( info );
        res.status( 201 ).json( {
          success: true,
          data: user,
          message: 'User created successfully, welcome email sent.'
        } );
      }
    } );
  } catch (error) {
    res.status( 500 ).json( {
      success: false,
      data: null,
      message: 'Failed to create user: ' + error.message
    } );
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne( { where: { email } } );
    if (!user) {
      return res.status( 404 ).json( {
        success: false,
        data: null,
        message: 'User not found'
      } );
    }
    const hashPassword = await bcrypt.hash( password, user.salt );
    if (hashPassword !== user.hashPassword) {
      return res.status( 401 ).json( {
        success: false,
        data: null,
        message: 'Invalid password'
      } );
    }
    const token = jwt.sign( { id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' } );
    res.json( {
      success: true,
      data: { ...user.dataValues, token },
      message: 'Login successful'
    } );
  } catch (error) {
    console.log( error )
    res.status( 500 ).json( {
      success: false,
      data: error,
      message: 'An error occurred'
    } );
  }
};

module.exports = { signup, login };
