const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

    type: {
      type: String,
      enum: ["regular", "extra"],
      default: "regular"
    },

    status: {
      type: String,
      enum: [
        "scheduled",
        "pending",
        "rejected"
      ],
      default: "scheduled"
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    requestReason: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

lectureSchema.index({
  instructor: 1,
  date: 1,
  startTime: 1
});

const Lecture =
  mongoose.models.Lecture ||
  mongoose.model("Lecture", lectureSchema);

module.exports = Lecture;
