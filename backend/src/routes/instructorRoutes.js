const express = require("express");

const {
  getInstructors,
  getInstructorById,
  getMyLectures,
  createInstructor
} = require("../controllers/instructorController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Instructor's own lectures
router.get(
  "/me/lectures",
  protect,
  authorizeRoles("instructor"),
  getMyLectures
);

// Admin creates instructor
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createInstructor
);

// Admin gets all instructors
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getInstructors
);

// Admin gets instructor by ID
router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getInstructorById
);

module.exports = router;