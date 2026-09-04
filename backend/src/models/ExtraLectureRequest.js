const mongoose = require("mongoose");

const extraLectureRequestSchema =
  new mongoose.Schema(
    {
      instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },

      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
      },

      date: {
        type: Date,
        required: true
      },

      startTime: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
      },

      endTime: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
      },

      reason: {
        type: String,
        required: true,
        trim: true
      },

      status: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected"
        ],
        default: "pending"
      },

      adminNote: {
        type: String,
        default: ""
      },

      lecture: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
        default: null
      }
    },
    {
      timestamps: true
    }
  );

const ExtraLectureRequest =
  mongoose.models.ExtraLectureRequest ||
  mongoose.model(
    "ExtraLectureRequest",
    extraLectureRequestSchema
  );

module.exports = ExtraLectureRequest;