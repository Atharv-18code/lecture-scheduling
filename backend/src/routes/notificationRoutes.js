const express = require("express");

const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getNotifications
);

router.patch(
  "/read-all",
  protect,
  authorizeRoles("admin"),
  markAllNotificationsAsRead
);

router.patch(
  "/:id/read",
  protect,
  authorizeRoles("admin"),
  markNotificationAsRead
);

module.exports = router;