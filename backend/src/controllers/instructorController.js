const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Lecture = require("../models/lecture");


const createInstructor = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const instructor = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "instructor"
    });

    res.status(201).json({
      success: true,
      message: "Instructor created successfully",
      instructor: {
        id: instructor._id,
        name: instructor.name,
        email: instructor.email,
        role: instructor.role
      }
    });
  } catch (error) {
    console.error("Create instructor error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

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
  getMyLectures,
  createInstructor
};
