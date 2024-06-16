const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const cors = require( 'cors' ); // Import the cors package
const authRoutes = require( './routes/authRoutes' );
const courseRoutes = require( './routes/courseRoutes' );
const {
  sequelize,
  createAdminUser
} = require( "./models" )

require( 'dotenv' ).config();

const app = express();
app.use( bodyParser.json() );
app.use( cors() );

app.use( '/auth', authRoutes );
app.use( '/courses', courseRoutes );

sequelize.sync( { force: false } ).then( () => {
  createAdminUser();
  console.log( "Database & tables created!" );

} ).then(
    (res) => {
      console.log( "admin created successfully" )
    } )
    .catch( (e) => {
      console.log( "Error starting server:", e );
    } )

const PORT = process.env.PORT || 4000;
app.listen( PORT, () => {
  console.log( `Server is running on port ${PORT}` );
} );