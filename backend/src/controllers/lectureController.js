const Lecture = require("../models/lecture");
const Course = require("../models/course");
const User = require("../models/user");

const normalizeDate = (date) => {
  const normalizedDate = new Date(date);

  if (isNaN(normalizedDate.getTime())) {
    return null;
  }

  normalizedDate.setHours(0, 0, 0, 0);

  return normalizedDate;
};

const validateLectureData = async (
  course,
  instructor,
  date,
  currentLectureId = null
) => {
  const existingCourse =
    await Course.findById(course);

  if (!existingCourse) {
    return {
      error: "Course not found"
    };
  }

  const existingInstructor =
    await User.findOne({
      _id: instructor,
      role: "instructor"
    });

  if (!existingInstructor) {
    return {
      error: "Instructor not found"
    };
  }

  const lectureDate = normalizeDate(date);

  if (!lectureDate) {
    return {
      error: "Invalid lecture date"
    };
  }

  const courseStartDate = normalizeDate(
    existingCourse.startDate
  );

  const courseEndDate = normalizeDate(
    existingCourse.endDate
  );

  if (
    lectureDate < courseStartDate ||
    lectureDate > courseEndDate
  ) {
    return {
      error:
        "Lecture date must be between the course start date and end date."
    };
  }

  const query = {
    instructor,
    date: lectureDate
  };

  if (currentLectureId) {
    query._id = {
      $ne: currentLectureId
    };
  }

  const existingLecture =
    await Lecture.findOne(query);

  if (existingLecture) {
    return {
      error:
        "This instructor already has a lecture scheduled on this date."
    };
  }

  return {
    lectureDate,
    existingCourse,
    existingInstructor
  };
};

const createLecture = async (req, res) => {
  try {
    const {
      title,
      course,
      instructor,
      date
    } = req.body;

    if (
      !title ||
      !course ||
      !instructor ||
      !date
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, course, instructor and date are required"
      });
    }

    const validation =
      await validateLectureData(
        course,
        instructor,
        date
      );

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const lecture = await Lecture.create({
      title: title.trim(),
      course,
      instructor,
      date: validation.lectureDate
    });

    const populatedLecture =
      await Lecture.findById(
        lecture._id
      )
        .populate(
          "course",
          "name level startDate endDate"
        )
        .populate(
          "instructor",
          "name email"
        );

    res.status(201).json({
      success: true,
      message:
        "Lecture scheduled successfully",
      lecture: populatedLecture
    });
  } catch (error) {
    console.error(
      "Create lecture error:",
      error
    );

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

const getLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find()
      .populate(
        "course",
        "name level startDate endDate"
      )
      .populate(
        "instructor",
        "name email"
      )
      .sort({
        date: 1
      });

    res.status(200).json({
      success: true,
      count: lectures.length,
      lectures
    });
  } catch (error) {
    console.error(
      "Get lectures error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getLectureById = async (req, res) => {
  try {
    const lecture =
      await Lecture.findById(
        req.params.id
      )
        .populate(
          "course",
          "name level startDate endDate"
        )
        .populate(
          "instructor",
          "name email"
        );

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
    console.error(
      "Get lecture error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const updateLecture = async (req, res) => {
  try {
    const {
      title,
      course,
      instructor,
      date
    } = req.body;

    if (
      !title ||
      !course ||
      !instructor ||
      !date
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, course, instructor and date are required"
      });
    }

    const lecture =
      await Lecture.findById(
        req.params.id
      );

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });
    }

    const validation =
      await validateLectureData(
        course,
        instructor,
        date,
        req.params.id
      );

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    lecture.title = title.trim();
    lecture.course = course;
    lecture.instructor = instructor;
    lecture.date = validation.lectureDate;

    await lecture.save();

    const updatedLecture =
      await Lecture.findById(
        lecture._id
      )
        .populate(
          "course",
          "name level startDate endDate"
        )
        .populate(
          "instructor",
          "name email"
        );

    res.status(200).json({
      success: true,
      message:
        "Lecture updated successfully",
      lecture: updatedLecture
    });
  } catch (error) {
    console.error(
      "Update lecture error:",
      error
    );

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

module.exports = {
  createLecture,
  getLectures,
  getLectureById,
  updateLecture
};