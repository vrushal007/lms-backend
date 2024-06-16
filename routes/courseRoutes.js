const express = require( 'express' );
const router = express.Router();
const coursesController = require( '../controllers/courseController' );
const authMiddleware = require( '../middleware/authMiddleware' );

router.post( '/', authMiddleware, coursesController.createCourse );
router.get( '/', authMiddleware, coursesController.getAllCourses );
router.get( '/:id', authMiddleware, coursesController.getCourseById );
router.put( '/:id', authMiddleware, coursesController.updateCourse );
router.delete( '/:id', authMiddleware, coursesController.deleteCourse );
router.post( "/:id/enroll", authMiddleware, coursesController.enrollUser );
router.post( "/lecture/:id/completeToggle", authMiddleware, coursesController.completeToggleLecture )
router.get( '/byUserId/:id', authMiddleware, coursesController.getCoursesByUserId )
router.get( "/graph/enrolled", authMiddleware, coursesController.graphData )

module.exports = router;