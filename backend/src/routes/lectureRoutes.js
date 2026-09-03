const express = require("express");

const {
  createLecture,
  getLectures,
  getLectureById
} = require("../controllers/lectureController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// Admin creates lecture
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createLecture
);


// Admin can view all lectures
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getLectures
);


// Admin can view one lecture
router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getLectureById
);


module.exports = router;