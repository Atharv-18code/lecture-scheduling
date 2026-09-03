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

    streamifier
      .createReadStream(fileBuffer)
      .pipe(uploadStream);
  });
};

const normalizeDate = (date) => {
  const normalizedDate = new Date(date);

  if (isNaN(normalizedDate.getTime())) {
    return null;
  }

  normalizedDate.setHours(0, 0, 0, 0);

  return normalizedDate;
};

const createCourse = async (req, res) => {
  try {
    const {
      name,
      level,
      description,
      startDate,
      endDate
    } = req.body;

    if (
      !name ||
      !level ||
      !description ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, level, description, start date and end date are required"
      });
    }

    const courseStartDate = normalizeDate(startDate);
    const courseEndDate = normalizeDate(endDate);

    if (!courseStartDate || !courseEndDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date or end date"
      });
    }

    if (courseEndDate < courseStartDate) {
      return res.status(400).json({
        success: false,
        message:
          "End date cannot be before start date"
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
      name: name.trim(),
      level,
      description: description.trim(),
      image,
      startDate: courseStartDate,
      endDate: courseEndDate
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course
    });
  } catch (error) {
    console.error(
      "Create course error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .sort({
        startDate: 1,
        createdAt: -1
      });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    console.error(
      "Get courses error:",
      error
    );

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
    console.error(
      "Get course error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const updateCourse = async (req, res) => {
  try {
    const {
      name,
      level,
      description,
      startDate,
      endDate
    } = req.body;

    const course = await Course.findById(
      req.params.id
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    if (
      !name ||
      !level ||
      !description ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, level, description, start date and end date are required"
      });
    }

    const courseStartDate = normalizeDate(startDate);
    const courseEndDate = normalizeDate(endDate);

    if (!courseStartDate || !courseEndDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date or end date"
      });
    }

    if (courseEndDate < courseStartDate) {
      return res.status(400).json({
        success: false,
        message:
          "End date cannot be before start date"
      });
    }

    course.name = name.trim();
    course.level = level;
    course.description = description.trim();
    course.startDate = courseStartDate;
    course.endDate = courseEndDate;

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer
      );

      course.image = result.secure_url;
    }

    await course.save();

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course
    });
  } catch (error) {
    console.error(
      "Update course error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse
};