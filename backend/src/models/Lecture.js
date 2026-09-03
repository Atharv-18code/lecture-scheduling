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
    }
  },
  {
    timestamps: true
  }
);

// Prevent an instructor from having
// more than one lecture on the same date
lectureSchema.index(
  {
    instructor: 1,
    date: 1
  },
  {
    unique: true
  }
);

const Lecture =
  mongoose.models.Lecture ||
  mongoose.model("Lecture", lectureSchema);

module.exports = Lecture;