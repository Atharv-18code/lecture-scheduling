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


router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createLecture
);


router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getLectures
);


router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getLectureById
);


router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateLecture
);

module.exports = router;
