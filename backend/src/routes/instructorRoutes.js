const express = require("express");

const {
  getInstructors,
  getInstructorById,
  getMyLectures
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

// Admin routes
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getInstructors
);

router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getInstructorById
);

module.exports = router;