const express = require("express");

const {
  createCourse,
  getCourses,
  getCourseById
} = require("../controllers/courseController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  upload.single("image"),
  createCourse
);

router.get(
  "/",
  protect,
  getCourses
);

router.get(
  "/:id",
  protect,
  getCourseById
);

module.exports = router;