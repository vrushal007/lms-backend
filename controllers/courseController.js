const { Course, LectureLink, Enrollment, LectureCompletion, sequelize } = require( '../models' );
const { Op } = require( "sequelize" );

const createCourse = async (req, res) => {
  const { title, description, category, instructorName, totalDuration, price, thumbnail, lectureLinks } = req.body;

  try {
    const course = await Course.create( {
      title,
      description,
      category,
      instructorName,
      totalDuration,
      price,
      thumbnail
    } );

    if (lectureLinks && Array.isArray( lectureLinks )) {
      const links = lectureLinks.map( link => ({
        courseId: course.id,
        label: link.label,
        link: link.link
      }) );

      await LectureLink.bulkCreate( links );
    }

    res.status( 201 ).json( {
      success: true,
      data: {
        ...course.get( { plain: true } ),
        lectureLinks
      },
      message: 'Course created successfully'
    } );
  } catch (error) {
    console.error( "Error creating course:", error );
    res.status( 400 ).json( {
      success: false,
      data: null,
      message: 'Failed to create course: ' + error.message
    } );
  }
};

const getAllCourses = async (req, res) => {
  const userId = req.userId;
  const search = req.query.search;

  try {
    const courses = await Course.findAll( {
      include: [{
        model: Enrollment,
        where: { userId: userId },
        required: false
      }],

      where: search?.length ? {
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { instructorName: { [Op.like]: `%${search}%` } },
          sequelize.where( sequelize.fn( 'JSON_CONTAINS', sequelize.col( 'category' ), sequelize.literal( `'["${search}"]'` ) ), 1 )
        ]
      } : null
    } );
    const coursesWithEnrollmentInfo = courses.map( course => {
      const isEnrolled = course?.Enrollments?.length > 0;
      return {
        ...course.toJSON(),
        isEnrolled: isEnrolled
      };
    } );

    res.json( {
      success: true,
      data: coursesWithEnrollmentInfo,
      message: "Courses retrieved successfully with enrollment status."
    } );
  } catch (error) {
    console.log( error )
    res.status( 500 ).json( {
      success: false,
      data: null,
      message: 'Failed to retrieve courses: ' + error.message
    } );
  }
};

const getCourseById = async (req, res) => {
  const userId = req.userId
  try {
    const course = await Course.findByPk( req.params.id, {
      include: [{ model: LectureLink }, {
        model: Enrollment,
        where: { userId: userId },
        required: false
      }, {
        model: LectureCompletion,
        where: { userId: userId },
        required: false

      }]
    } );

    if (!course) {
      return res.status( 404 ).json( {
        success: false,
        data: null,
        message: 'Course not found'
      } );
    }

    const completionPercentage =
        !course?.LectureCompletions?.length ? 0 :
            course?.LectureCompletions?.reduce( (acc, curr) => {
              acc += curr.isCompleted ? 1 : 0;
              return acc
            }, 0 ) / course?.LectureCompletions?.length * 100;

    res.status( 200 ).json( {
      success: true,
      data: {
        ...course.toJSON(),
        completionPercentage
      },
      message: 'Course retrieved successfully'
    } );
  } catch (error) {
    res.status( 500 ).json( {
      success: false,
      data: null,
      message: 'Failed to retrieve course: ' + error.message
    } );
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByPk( req.params.id );
    if (!course) {
      return res.status( 404 ).json( {
        success: false,
        data: null,
        message: 'Course not found'
      } );
    }

    const updatedCourse = await course.update( req.body );
    res.status( 200 ).json( {
      success: true,
      data: updatedCourse,
      message: 'Course updated successfully'
    } );
  } catch (error) {
    res.status( 400 ).json( {
      success: false,
      data: null,
      message: 'Failed to update course: ' + error.message
    } );
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk( req.params.id, {
      include: [{ model: LectureLink }]
    } );
    if (!course) {
      return res.status( 404 ).json( {
        success: false,
        data: null,
        message: 'Course not found'
      } );
    }
    await course.destroy();
    res.status( 204 ).json( {
      success: true,
      data: null,
      message: 'Course deleted successfully'
    } );
  } catch (error) {
    res.status( 500 ).json( {
      success: false,
      data: null,
      message: 'Failed to delete course: ' + error.message
    } );
  }
};

const enrollUser = async (req, res) => {
  const userId = req.userId;
  const courseId = req.params.id;
  try {
    const enrollment = await Enrollment.create( {
      userId,
      courseId
    } );

    const course = await Course.findByPk( courseId, {
      include: [LectureLink]
    } );
    const lectureLinks = course.LectureLinks.map( link => ({
      userId,
      courseId,
      lectureId: link.id
    }) );

    await LectureCompletion.bulkCreate( lectureLinks );

    res.status( 201 ).json( {
      success: true,
      data: enrollment,
      message: 'Enrolled successfully'
    } );
  } catch (error) {
    res.status( 500 ).json( {
      success: false,
      data: null,
      message: 'Failed to enroll: ' + error.message
    } );
  }
}

const completeToggleLecture = async (req, res) => {
  const userId = req.userId

  try {
    const lectureCompletion = await LectureCompletion.findOne( {
      where: {
        userId,
        lectureId: req.params.id
      }
    } );

    const result = await lectureCompletion.update( {
      isCompleted: !lectureCompletion.isCompleted
    } );

    return res.status( 200 ).json( {
      success: true,
      data: result,
      message: 'Lecture completed successfully'
    } );


  } catch (error) {
    res.status( 500 ).json( {
      success: false,
      data: error,
      message: 'Failed to enroll: ' + error.message
    } );
  }
}

const getCoursesByUserId = async (req, res) => {
  const userId = req.params.id
  try {
    const courses = await Course.findAll( {
      include: [{
        model: Enrollment,
        where: { userId: userId },
        required: true
      }]
    } );

    const modifiedCourses = courses.map( course => {
      return {
        ...course.toJSON(),
        isEnrolled: true
      }
    } )

    res.json( {
      success: true,
      data: modifiedCourses,
      message: "Courses retrieved successfully"
    } );
  } catch (error) {
    res.status( 500 ).json( {
      success: false,
      data: null,
      message: 'Failed to retrieve courses: ' + error.message
    } );
  }

}

const graphData = async (req, res) => {
  // find course and total enrolled users in that course
  const courses = await Course.findAll( {
    include: [{
      model: Enrollment,
      required: false
    }]
  } );

  const graphData = courses.map( course => {
    return {
      title: course.title,
      totalEnrolled: course.Enrollments.length
    }
  } );

  res.json( {
    success: true,
    data: graphData,
    message: "Graph data retrieved successfully"
  } );

}

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollUser,
  completeToggleLecture,
  getCoursesByUserId,
  graphData
};
