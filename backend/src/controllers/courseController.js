const Course = require("../models/course");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "lecture-scheduling/courses"
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

const createCourse = async (req, res) => {
  try {
    const { name, level, description } = req.body;

    if (!name || !level || !description) {
      return res.status(400).json({
        success: false,
        message: "Name, level and description are required"
      });
    }

    let image = "";

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer
      );

      image = result.secure_url;
    }

    const course = await Course.create({
      name,
      level,
      description,
      image
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course
    });
  } catch (error) {
    console.error("Create course error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    console.error("Get courses error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(
      req.params.id
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    res.status(200).json({
      success: true,
      course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById
};