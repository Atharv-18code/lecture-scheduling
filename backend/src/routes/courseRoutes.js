const express = require("express");

const {
  createCourse,
  getCourses,
  getCourseById
} = require("../controllers/courseController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin can create course
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createCourse
);

// Logged-in users can view courses
router.get(
  "/",
  protect,
  getCourses
);

// Logged-in users can view one course
router.get(
  "/:id",
  protect,
  getCourseById
);

module.exports = router;