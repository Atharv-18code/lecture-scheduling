const ExtraLectureRequest =
  require("../models/ExtraLectureRequest");

const Lecture =
  require("../models/lecture");

const Course =
  require("../models/course");

const User =
  require("../models/user");

const normalizeDate = (date) => {
  const normalizedDate = new Date(date);

  if (isNaN(normalizedDate.getTime())) {
    return null;
  }

  normalizedDate.setHours(0, 0, 0, 0);

  return normalizedDate;
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

const checkConflict = async ({
  instructor,
  date,
  startTime,
  endTime
}) => {
  const lectures =
    await Lecture.find({
      instructor,
      date,
      status: "scheduled"
    });

  return lectures.find((lecture) =>
    hasTimeConflict(
      startTime,
      endTime,
      lecture.startTime,
      lecture.endTime
    )
  );
};

const createExtraLectureRequest =
  async (req, res) => {
    try {
      const {
        course,
        date,
        startTime,
        endTime,
        reason
      } = req.body;

      if (
        !course ||
        !date ||
        !startTime ||
        !endTime ||
        !reason
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Course, date, start time, end time and reason are required"
        });
      }

      const instructorId =
        req.user.id;

      const existingCourse =
        await Course.findOne({
          _id: course,
          instructor: instructorId
        });

      if (!existingCourse) {
        return res.status(403).json({
          success: false,
          message:
            "You can request an extra lecture only for your assigned course."
        });
      }

      const lectureDate =
        normalizeDate(date);

      if (!lectureDate) {
        return res.status(400).json({
          success: false,
          message: "Invalid date"
        });
      }

      const courseStart =
        normalizeDate(
          existingCourse.startDate
        );

      const courseEnd =
        normalizeDate(
          existingCourse.endDate
        );

      if (
        lectureDate < courseStart ||
        lectureDate > courseEnd
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Extra lecture date must be inside the course period."
        });
      }

      if (
        timeToMinutes(endTime) <=
        timeToMinutes(startTime)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "End time must be after start time."
        });
      }

      const conflict =
        await checkConflict({
          instructor: instructorId,
          date: lectureDate,
          startTime,
          endTime
        });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message:
            `You already have a lecture from ${conflict.startTime} to ${conflict.endTime} on this date.`
        });
      }

      const pendingRequest =
        await ExtraLectureRequest.findOne({
          instructor: instructorId,
          course,
          date: lectureDate,
          status: "pending"
        });

      if (pendingRequest) {
        return res.status(409).json({
          success: false,
          message:
            "You already have a pending request for this date."
        });
      }

      const request =
        await ExtraLectureRequest.create({
          instructor: instructorId,
          course,
          date: lectureDate,
          startTime,
          endTime,
          reason,
          status: "pending"
        });

      const populatedRequest =
        await ExtraLectureRequest.findById(
          request._id
        )
          .populate(
            "instructor",
            "name email"
          )
          .populate(
            "course",
            "name level"
          );

      res.status(201).json({
        success: true,
        message:
          "Extra lecture request sent to admin.",
        request:
          populatedRequest
      });
    } catch (error) {
      console.error(
        "Create extra lecture request error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  };

const getMyExtraLectureRequests =
  async (req, res) => {
    try {
      const requests =
        await ExtraLectureRequest.find({
          instructor: req.user.id
        })
          .populate(
            "course",
            "name level"
          )
          .sort({
            createdAt: -1
          });

      res.status(200).json({
        success: true,
        count: requests.length,
        requests
      });
    } catch (error) {
      console.error(
        "Get my extra requests error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  };

const getExtraLectureRequests =
  async (req, res) => {
    try {
      const requests =
        await ExtraLectureRequest.find()
          .populate(
            "instructor",
            "name email"
          )
          .populate(
            "course",
            "name level"
          )
          .sort({
            createdAt: -1
          });

      res.status(200).json({
        success: true,
        count: requests.length,
        requests
      });
    } catch (error) {
      console.error(
        "Get extra requests error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  };

const approveExtraLecture =
  async (req, res) => {
    try {
      const request =
        await ExtraLectureRequest.findById(
          req.params.id
        );

      if (!request) {
        return res.status(404).json({
          success: false,
          message:
            "Extra lecture request not found"
        });
      }

      if (request.status !== "pending") {
        return res.status(400).json({
          success: false,
          message:
            "This request has already been processed."
        });
      }

      const conflict =
        await checkConflict({
          instructor:
            request.instructor,
          date: request.date,
          startTime:
            request.startTime,
          endTime:
            request.endTime
        });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message:
            `Cannot approve. Instructor already has a lecture from ${conflict.startTime} to ${conflict.endTime}.`
        });
      }

      const course =
        await Course.findById(
          request.course
        );

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found"
        });
      }

      const lecture =
        await Lecture.create({
          title:
            `${course.name} - Extra Lecture`,
          course: request.course,
          instructor:
            request.instructor,
          date: request.date,
          startTime:
            request.startTime,
          endTime:
            request.endTime,
          type: "extra",
          status: "scheduled"
        });

      request.status =
        "approved";

      request.lecture =
        lecture._id;

      await request.save();

      const populatedLecture =
        await Lecture.findById(
          lecture._id
        )
          .populate(
            "course",
            "name level"
          )
          .populate(
            "instructor",
            "name email"
          );

      res.status(200).json({
        success: true,
        message:
          "Extra lecture approved successfully.",
        lecture:
          populatedLecture
      });
    } catch (error) {
      console.error(
        "Approve extra lecture error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  };

const rejectExtraLecture =
  async (req, res) => {
    try {
      const { adminNote } =
        req.body;

      const request =
        await ExtraLectureRequest.findById(
          req.params.id
        );

      if (!request) {
        return res.status(404).json({
          success: false,
          message:
            "Extra lecture request not found"
        });
      }

      if (request.status !== "pending") {
        return res.status(400).json({
          success: false,
          message:
            "This request has already been processed."
        });
      }

      request.status =
        "rejected";

      request.adminNote =
        adminNote?.trim() || "";

      await request.save();

      res.status(200).json({
        success: true,
        message:
          "Extra lecture request rejected.",
        request
      });
    } catch (error) {
      console.error(
        "Reject extra lecture error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  };

module.exports = {
  createExtraLectureRequest,
  getMyExtraLectureRequests,
  getExtraLectureRequests,
  approveExtraLecture,
  rejectExtraLecture
};
