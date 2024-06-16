const jwt = require( 'jsonwebtoken' );
require( 'dotenv' ).config();

const authenticateToken = (req, res, next) => {
  const token = req.header( 'Authorization' )?.split( ' ' )[1];
  if (!token) {
    return res.status( 401 ).json( {
      success: false,
      data: null,
      message: 'Access denied, token missing!'
    } );
  }
  try {
    jwt.verify( token, process.env.JWT_SECRET, (err, user) => {
      if (err) throw err;
      console.log( "user", user )
      req.userId = user.id;
      next();
    } );
  } catch (error) {
    res.status( 400 ).json( {
      success: false,
      data: null,
      message: 'Invalid token'
    } );
  }
};

module.exports = authenticateToken;