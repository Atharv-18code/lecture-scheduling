const User = require("../models/user");
const Lecture = require("../models/lecture");

// Get all instructors
const getInstructors = async (req, res) => {
  try {
    const instructors = await User.find({
      role: "instructor"
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: instructors.length,
      instructors
    });

  } catch (error) {
    console.error("Get instructors error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// Get single instructor
const getInstructorById = async (req, res) => {
  try {
    const instructor = await User.findOne({
      _id: req.params.id,
      role: "instructor"
    }).select("-password");

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found"
      });
    }

    res.status(200).json({
      success: true,
      instructor
    });

  } catch (error) {
    console.error("Get instructor error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getMyLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find({
      instructor: req.user.id
    })
      .populate("course", "name level description")
      .populate("instructor", "name email")
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: lectures.length,
      lectures
    });
  } catch (error) {
    console.error("Get my lectures error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  getInstructors,
  getInstructorById,
  getMyLectures
};