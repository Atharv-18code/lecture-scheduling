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



router.post(
  "/",
  protect,
  authorizeRoles("instructor"),
  createExtraLectureRequest
);


router.get(
  "/my",
  protect,
  authorizeRoles("instructor"),
  getMyExtraLectureRequests
);



router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getExtraLectureRequests
);


router.put(
  "/:id/approve",
  protect,
  authorizeRoles("admin"),
  approveExtraLecture
);


router.put(
  "/:id/reject",
  protect,
  authorizeRoles("admin"),
  rejectExtraLecture
);

module.exports = router;
