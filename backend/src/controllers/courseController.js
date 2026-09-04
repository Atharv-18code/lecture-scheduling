const Course = require("../models/course");
const Lecture = require("../models/lecture");
const User = require("../models/user");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");


// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const normalizeDate = (date) => {
  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return null;
  }

  d.setHours(0, 0, 0, 0);

  return d;
};


const isValidTime = (time) => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
};


const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};


const hasTimeConflict = (
  existingStart,
  existingEnd,
  newStart,
  newEnd
) => {
  return (
    timeToMinutes(existingStart) < timeToMinutes(newEnd) &&
    timeToMinutes(existingEnd) > timeToMinutes(newStart)
  );
};


const getDayName = (date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "long"
  });
};


const generateScheduleDates = (
  startDate,
  endDate,
  weeklyDays
) => {
  const dates = [];

  const current = new Date(startDate);

  current.setHours(0, 0, 0, 0);

  const lastDate = new Date(endDate);

  lastDate.setHours(0, 0, 0, 0);

  while (current <= lastDate) {
    const dayName = getDayName(current);

    if (weeklyDays.includes(dayName)) {
      dates.push(new Date(current));
    }

    current.setDate(current.getDate() + 1);
  }

  return dates;
};


// --------------------------------------------------
// CLOUDINARY UPLOAD
// --------------------------------------------------

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder: "lecture-scheduling/courses"
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      );

    streamifier
      .createReadStream(fileBuffer)
      .pipe(uploadStream);
  });
};


// --------------------------------------------------
// CHECK INSTRUCTOR CONFLICT
// --------------------------------------------------

const checkInstructorConflict = async ({
  instructor,
  date,
  startTime,
  endTime,
  excludeCourseId = null
}) => {
  const query = {
    instructor,
    date: normalizeDate(date),
    status: {
      $in: ["scheduled", "pending"]
    }
  };

  const lectures = await Lecture.find(query);

  const conflictingLecture = lectures.find(
    (lecture) => {
      if (
        excludeCourseId &&
        lecture.course &&
        lecture.course.toString() ===
          excludeCourseId.toString()
      ) {
        return false;
      }

      return hasTimeConflict(
        lecture.startTime,
        lecture.endTime,
        startTime,
        endTime
      );
    }
  );

  return conflictingLecture || null;
};


// --------------------------------------------------
// CREATE COURSE
// --------------------------------------------------

const createCourse = async (req, res) => {
  try {
    const {
      name,
      level,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      instructor
    } = req.body;

    // Support both names temporarily
    let weeklyDays =
      req.body.weeklyDays ??
      req.body.scheduleDays;

    // ------------------------------
    // REQUIRED VALIDATION
    // ------------------------------

    if (
      !name ||
      !level ||
      !description ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime ||
      !instructor
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All course fields except image are required"
      });
    }


    // ------------------------------
    // WEEKLY DAYS
    // ------------------------------

    if (typeof weeklyDays === "string") {
      try {
        weeklyDays = JSON.parse(weeklyDays);
      } catch {
        weeklyDays = weeklyDays
          .split(",")
          .map((day) => day.trim())
          .filter(Boolean);
      }
    }

    if (
      !Array.isArray(weeklyDays) ||
      weeklyDays.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one weekly day is required"
      });
    }


    // ------------------------------
    // DATE VALIDATION
    // ------------------------------

    const normalizedStartDate =
      normalizeDate(startDate);

    const normalizedEndDate =
      normalizeDate(endDate);

    if (
      !normalizedStartDate ||
      !normalizedEndDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid start or end date"
      });
    }

    if (normalizedEndDate < normalizedStartDate) {
      return res.status(400).json({
        success: false,
        message:
          "End date cannot be before start date"
      });
    }


    // ------------------------------
    // TIME VALIDATION
    // ------------------------------

    if (
      !isValidTime(startTime) ||
      !isValidTime(endTime)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Time must be in HH:mm format"
      });
    }

    if (
      timeToMinutes(startTime) >=
      timeToMinutes(endTime)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "End time must be after start time"
      });
    }


    // ------------------------------
    // CHECK INSTRUCTOR
    // ------------------------------

    const instructorUser =
      await User.findOne({
        _id: instructor,
        role: "instructor"
      });

    if (!instructorUser) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found"
      });
    }


    // ------------------------------
    // GENERATE DATES
    // ------------------------------

    const scheduleDates =
      generateScheduleDates(
        normalizedStartDate,
        normalizedEndDate,
        weeklyDays
      );

    if (scheduleDates.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No dates match the selected weekly days"
      });
    }


    // ------------------------------
    // CHECK CONFLICTS
    // ------------------------------

    for (const date of scheduleDates) {
      const conflict =
        await checkInstructorConflict({
          instructor,
          date,
          startTime,
          endTime
        });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message:
            `Instructor already has a lecture on ${date.toDateString()} from ${conflict.startTime} to ${conflict.endTime}`
        });
      }
    }


    // ------------------------------
    // OPTIONAL IMAGE
    // ------------------------------

    let imageUrl = "";

    if (req.file) {
      imageUrl =
        await uploadToCloudinary(
          req.file.buffer
        );
    }


    // ------------------------------
    // CREATE COURSE
    // ------------------------------

    const course =
      await Course.create({
        name: name.trim(),
        level,
        description: description.trim(),
        image: imageUrl,
        startDate: normalizedStartDate,
        endDate: normalizedEndDate,
        instructor,
        weeklyDays,
        startTime,
        endTime
      });


    // ------------------------------
    // CREATE LECTURES
    // ------------------------------

    const lectures =
      scheduleDates.map((date) => ({
        title: course.name,

        course: course._id,

        instructor,

        date,

        startTime,

        endTime,

        type: "regular",

        status: "scheduled",

        requestedBy: null,

        requestReason: ""
      }));


    await Lecture.insertMany(lectures);


    const populatedCourse =
      await Course.findById(course._id)
        .populate(
          "instructor",
          "name email"
        );


    return res.status(201).json({
      success: true,
      message:
        "Course and lectures created successfully",
      course: populatedCourse,
      lectureCount: lectures.length
    });

  } catch (error) {

    console.error(
      "Create course error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message || "Server error"
    });
  }
};


// --------------------------------------------------
// GET ALL COURSES
// --------------------------------------------------

const getCourses = async (req, res) => {
  try {
    const courses =
      await Course.find()
        .populate(
          "instructor",
          "name email"
        )
        .sort({
          createdAt: -1
        });

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });

  } catch (error) {

    console.error(
      "Get courses error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// --------------------------------------------------
// GET COURSE BY ID
// --------------------------------------------------

const getCourseById = async (req, res) => {
  try {

    const course =
      await Course.findById(
        req.params.id
      ).populate(
        "instructor",
        "name email"
      );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    return res.status(200).json({
      success: true,
      course
    });

  } catch (error) {

    console.error(
      "Get course error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// --------------------------------------------------
// UPDATE COURSE
// --------------------------------------------------

const updateCourse = async (req, res) => {
  try {

    const course =
      await Course.findById(
        req.params.id
      );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }


    const {
      name,
      level,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      instructor
    } = req.body;


    // Support both names
    let weeklyDays =
      req.body.weeklyDays ??
      req.body.scheduleDays;


    // ------------------------------
    // USE EXISTING VALUES IF MISSING
    // ------------------------------

    const finalName =
      name !== undefined
        ? name.trim()
        : course.name;

    const finalLevel =
      level !== undefined
        ? level
        : course.level;

    const finalDescription =
      description !== undefined
        ? description.trim()
        : course.description;

    const finalStartDate =
      startDate !== undefined
        ? normalizeDate(startDate)
        : normalizeDate(course.startDate);

    const finalEndDate =
      endDate !== undefined
        ? normalizeDate(endDate)
        : normalizeDate(course.endDate);

    const finalStartTime =
      startTime !== undefined
        ? startTime
        : course.startTime;

    const finalEndTime =
      endTime !== undefined
        ? endTime
        : course.endTime;

    const finalInstructor =
      instructor !== undefined
        ? instructor
        : course.instructor;


    // ------------------------------
    // WEEKLY DAYS
    // ------------------------------

    if (weeklyDays === undefined) {
      weeklyDays = course.weeklyDays;
    }

    if (typeof weeklyDays === "string") {
      try {
        weeklyDays =
          JSON.parse(weeklyDays);
      } catch {
        weeklyDays = weeklyDays
          .split(",")
          .map((day) => day.trim())
          .filter(Boolean);
      }
    }

    if (
      !Array.isArray(weeklyDays) ||
      weeklyDays.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one weekly day is required"
      });
    }


    // ------------------------------
    // DATE VALIDATION
    // ------------------------------

    if (
      !finalStartDate ||
      !finalEndDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid dates"
      });
    }

    if (
      finalEndDate <
      finalStartDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "End date cannot be before start date"
      });
    }


    // ------------------------------
    // TIME VALIDATION
    // ------------------------------

    if (
      !isValidTime(finalStartTime) ||
      !isValidTime(finalEndTime)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Time must be in HH:mm format"
      });
    }

    if (
      timeToMinutes(finalStartTime) >=
      timeToMinutes(finalEndTime)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "End time must be after start time"
      });
    }


    // ------------------------------
    // CHECK INSTRUCTOR
    // ------------------------------

    const instructorUser =
      await User.findOne({
        _id: finalInstructor,
        role: "instructor"
      });

    if (!instructorUser) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found"
      });
    }


    // ------------------------------
    // GENERATE NEW DATES
    // ------------------------------

    const scheduleDates =
      generateScheduleDates(
        finalStartDate,
        finalEndDate,
        weeklyDays
      );


    if (scheduleDates.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No dates match the selected weekly days"
      });
    }


    // ------------------------------
    // CHECK CONFLICTS
    // ------------------------------

    for (const date of scheduleDates) {

      const conflict =
        await checkInstructorConflict({
          instructor: finalInstructor,
          date,
          startTime: finalStartTime,
          endTime: finalEndTime,
          excludeCourseId:
            course._id
        });

      if (conflict) {

        return res.status(409).json({
          success: false,
          message:
            `Instructor has another lecture on ${date.toDateString()} from ${conflict.startTime} to ${conflict.endTime}`
        });
      }
    }


    // ------------------------------
    // OPTIONAL IMAGE
    // ------------------------------

    let imageUrl = course.image || "";

    if (req.file) {
      imageUrl =
        await uploadToCloudinary(
          req.file.buffer
        );
    }


    // ------------------------------
    // UPDATE COURSE
    // ------------------------------

    course.name = finalName;
    course.level = finalLevel;
    course.description =
      finalDescription;

    course.startDate =
      finalStartDate;

    course.endDate =
      finalEndDate;

    course.instructor =
      finalInstructor;

    course.weeklyDays =
      weeklyDays;

    course.startTime =
      finalStartTime;

    course.endTime =
      finalEndTime;

    course.image =
      imageUrl;


    await course.save();


    // ------------------------------
    // DELETE OLD REGULAR LECTURES
    // ------------------------------

    await Lecture.deleteMany({
      course: course._id,
      type: "regular"
    });


    // ------------------------------
    // CREATE NEW REGULAR LECTURES
    // ------------------------------

    const lectures =
      scheduleDates.map((date) => ({
        title: course.name,

        course: course._id,

        instructor:
          finalInstructor,

        date,

        startTime:
          finalStartTime,

        endTime:
          finalEndTime,

        type: "regular",

        status: "scheduled",

        requestedBy: null,

        requestReason: ""
      }));


    await Lecture.insertMany(
      lectures
    );


    const populatedCourse =
      await Course.findById(
        course._id
      ).populate(
        "instructor",
        "name email"
      );


    return res.status(200).json({
      success: true,
      message:
        "Course updated successfully",
      course: populatedCourse,
      lectureCount: lectures.length
    });

  } catch (error) {

    console.error(
      "Update course error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message || "Server error"
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course =
      await Course.findById(
        req.params.id
      );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    await Lecture.deleteMany({
      course: course._id
    });

    await Course.findByIdAndDelete(
      course._id
    );

    return res.status(200).json({
      success: true,
      message:
        "Course and associated lectures deleted successfully"
    });

  } catch (error) {

    console.error(
      "Delete course error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message || "Server error"
    });
  }
};

// --------------------------------------------------
// EXPORT
// --------------------------------------------------

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse
};