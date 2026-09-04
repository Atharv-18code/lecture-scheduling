const Lecture = require("../models/Lecture");
const Course = require("../models/Course");
const User = require("../models/User");

const normalizeDate = (date) => {
  const normalizedDate = new Date(date);

  if (isNaN(normalizedDate.getTime())) {
    return null;
  }

  normalizedDate.setHours(0, 0, 0, 0);

  return normalizedDate;
};

const isValidTime = (time) => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(
    time
  );
};

const timeToMinutes = (time) => {
  const [hours, minutes] = time
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
};

const hasTimeConflict = (
  startTime,
  endTime,
  existingStart,
  existingEnd
) => {
  return (
    timeToMinutes(startTime) <
      timeToMinutes(existingEnd) &&
    timeToMinutes(endTime) >
      timeToMinutes(existingStart)
  );
};

const validateLecture = async ({
  course,
  instructor,
  date,
  startTime,
  endTime,
  currentLectureId = null
}) => {
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

  const lectureDate =
    normalizeDate(date);

  if (!lectureDate) {
    return {
      error: "Invalid lecture date"
    };
  }

  if (
    !isValidTime(startTime) ||
    !isValidTime(endTime)
  ) {
    return {
      error: "Invalid lecture time"
    };
  }

  if (
    timeToMinutes(endTime) <=
    timeToMinutes(startTime)
  ) {
    return {
      error:
        "End time must be after start time"
    };
  }

  const courseStartDate =
    normalizeDate(
      existingCourse.startDate
    );

  const courseEndDate =
    normalizeDate(
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
    date: lectureDate,
    status: "scheduled"
  };

  if (currentLectureId) {
    query._id = {
      $ne: currentLectureId
    };
  }

  const existingLectures =
    await Lecture.find(query);

  const conflict =
    existingLectures.find(
      (lecture) =>
        hasTimeConflict(
          startTime,
          endTime,
          lecture.startTime,
          lecture.endTime
        )
    );

  if (conflict) {
    return {
      error:
        `Instructor already has a lecture from ${conflict.startTime} to ${conflict.endTime} on this date.`
    };
  }

  return {
    lectureDate,
    existingCourse,
    existingInstructor
  };
};

const createLecture = async (
  req,
  res
) => {
  try {
    const {
      title,
      course,
      instructor,
      date,
      startTime,
      endTime
    } = req.body;

    if (
      !title ||
      !course ||
      !instructor ||
      !date ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, course, instructor, date, start time and end time are required"
      });
    }

    const validation =
      await validateLecture({
        course,
        instructor,
        date,
        startTime,
        endTime
      });

    if (validation.error) {
      return res.status(409).json({
        success: false,
        message: validation.error
      });
    }

    const lecture =
      await Lecture.create({
        title: title.trim(),
        course,
        instructor,
        date: validation.lectureDate,
        startTime,
        endTime,
        type: "regular",
        status: "scheduled"
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

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getLectures = async (
  req,
  res
) => {
  try {
    const lectures =
      await Lecture.find()
        .populate(
          "course",
          "name level startDate endDate"
        )
        .populate(
          "instructor",
          "name email"
        )
        .sort({
          date: 1,
          startTime: 1
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

const getLectureById = async (
  req,
  res
) => {
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

const updateLecture = async (
  req,
  res
) => {
  try {
    const {
      title,
      course,
      instructor,
      date,
      startTime,
      endTime
    } = req.body;

    if (
      !title ||
      !course ||
      !instructor ||
      !date ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, course, instructor, date, start time and end time are required"
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
      await validateLecture({
        course,
        instructor,
        date,
        startTime,
        endTime,
        currentLectureId:
          req.params.id
      });

    if (validation.error) {
      return res.status(409).json({
        success: false,
        message: validation.error
      });
    }

    lecture.title =
      title.trim();

    lecture.course = course;
    lecture.instructor = instructor;
    lecture.date =
      validation.lectureDate;
    lecture.startTime = startTime;
    lecture.endTime = endTime;

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