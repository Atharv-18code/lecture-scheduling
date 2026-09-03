const Lecture = require("../models/Lecture");
const Course = require("../models/Course");
const User = require("../models/User");

// Create Lecture
const createLecture = async (req, res) => {
  try {
    const { title, course, instructor, date } = req.body;

    // Validate required fields
    if (!title || !course || !instructor || !date) {
      return res.status(400).json({
        success: false,
        message: "Title, course, instructor and date are required"
      });
    }

    // Check course exists
    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Check instructor exists
    const existingInstructor = await User.findOne({
      _id: instructor,
      role: "instructor"
    });

    if (!existingInstructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found"
      });
    }

    // Normalize date to calendar day
    const lectureDate = new Date(date);

    if (isNaN(lectureDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date"
      });
    }

    lectureDate.setHours(0, 0, 0, 0);

    // Check instructor availability
    const existingLecture = await Lecture.findOne({
      instructor,
      date: lectureDate
    });

    if (existingLecture) {
      return res.status(400).json({
        success: false,
        message:
          "This instructor already has a lecture scheduled on this date."
      });
    }

    // Create lecture
    const lecture = await Lecture.create({
      title,
      course,
      instructor,
      date: lectureDate
    });

    // Return populated lecture
    const populatedLecture = await Lecture.findById(lecture._id)
      .populate("course", "name level")
      .populate("instructor", "name email");

    res.status(201).json({
      success: true,
      message: "Lecture scheduled successfully",
      lecture: populatedLecture
    });

  } catch (error) {
    console.error("Create lecture error:", error);

    // MongoDB duplicate key protection
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "This instructor already has a lecture scheduled on this date."
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// Get all lectures
const getLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find()
      .populate("course", "name level")
      .populate("instructor", "name email")
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: lectures.length,
      lectures
    });

  } catch (error) {
    console.error("Get lectures error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// Get single lecture
const getLectureById = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id)
      .populate("course", "name level")
      .populate("instructor", "name email");

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });
    }

    res.status(200).json({
      success: true,
      lecture
    });

  } catch (error) {
    console.error("Get lecture error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = {
  createLecture,
  getLectures,
  getLectureById
};