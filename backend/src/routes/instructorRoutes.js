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

router.get(
  "/me/lectures",
  protect,
  authorizeRoles("instructor"),
  getMyLectures
);

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createInstructor
);

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
