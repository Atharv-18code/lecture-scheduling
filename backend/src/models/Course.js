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
    }
  },
  {
    timestamps: true
  }
);

courseSchema.pre("validate", function (next) {
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

  next();
});

const Course =
  mongoose.models.Course ||
  mongoose.model("Course", courseSchema);

module.exports = Course;