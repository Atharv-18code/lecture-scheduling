const express = require("express");

const {
  createExtraLectureRequest,
  getMyExtraLectureRequests,
  getExtraLectureRequests,
  approveExtraLecture,
  rejectExtraLecture
} = require("../controllers/extraLectureController");

const protect =
  require("../middleware/authMiddleware");

const authorizeRoles =
  require("../middleware/roleMiddleware");

const router = express.Router();


// ======================================
// INSTRUCTOR
// ======================================

// Request extra lecture
router.post(
  "/",
  protect,
  authorizeRoles("instructor"),
  createExtraLectureRequest
);


// Instructor sees own requests
router.get(
  "/my",
  protect,
  authorizeRoles("instructor"),
  getMyExtraLectureRequests
);


// ======================================
// ADMIN
// ======================================

// Admin sees all requests
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getExtraLectureRequests
);


// Admin approves
router.put(
  "/:id/approve",
  protect,
  authorizeRoles("admin"),
  approveExtraLecture
);


// Admin rejects
router.put(
  "/:id/reject",
  protect,
  authorizeRoles("admin"),
  rejectExtraLecture
);

module.exports = router;