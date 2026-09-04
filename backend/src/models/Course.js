const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    level: {
      type: String,
      required: true,
      enum: [
        "Beginner",
        "Intermediate",
        "Advanced"
      ]
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    // Optional
    image: {
      type: String,
      default: ""
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    weeklyDays: {
      type: [String],
      required: true,
      validate: {
        validator: function (days) {
          return Array.isArray(days) && days.length > 0;
        },
        message: "At least one weekly day is required"
      }
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
    }
  },
  {
    timestamps: true
  }
);

courseSchema.pre("validate", function () {
  if (
    this.startDate &&
    this.endDate &&
    this.endDate < this.startDate
  ) {
    this.invalidate(
      "endDate",
      "End date cannot be before start date."
    );
  }

  if (this.startTime && this.endTime) {
    const [startHour, startMinute] =
      this.startTime.split(":").map(Number);

    const [endHour, endMinute] =
      this.endTime.split(":").map(Number);

    const startTotal =
      startHour * 60 + startMinute;

    const endTotal =
      endHour * 60 + endMinute;

    if (startTotal >= endTotal) {
      this.invalidate(
        "endTime",
        "End time must be after start time."
      );
    }
  }

});

const Course =
  mongoose.models.Course ||
  mongoose.model("Course", courseSchema);

module.exports = Course;