const express = require("express");

const {
  createLecture,
  getLectures,
  getLectureById,
  updateLecture
} = require("../controllers/lectureController");

const protect =
  require("../middleware/authMiddleware");

const authorizeRoles =
  require("../middleware/roleMiddleware");

const router = express.Router();


// Admin manual lecture creation
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createLecture
);


// Admin sees all lectures
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getLectures
);


// Admin sees one lecture
router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getLectureById
);


// Admin edits lecture
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateLecture
);

module.exports = router;