const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String,
      enum: ["extra_lecture_request"],
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1
});

const Notification =
  mongoose.models.Notification ||
  mongoose.model(
    "Notification",
    notificationSchema
  );

module.exports = Notification;