const express = require("express");

const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse
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

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  upload.single("image"),
  updateCourse
);

module.exports = router;