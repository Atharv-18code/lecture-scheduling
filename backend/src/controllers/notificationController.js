const Notification = require("../models/notification");

const getNotifications = async (req, res) => {
  try {
    const notifications =
      await Notification.find({
        recipient: req.user.id
      })
        .populate(
          "sender",
          "name email"
        )
        .populate({
          path: "lecture",
          populate: [
            {
              path: "course",
              select:
                "name level startDate endDate"
            },
            {
              path: "instructor",
              select:
                "name email"
            }
          ]
        })
        .sort({
          createdAt: -1
        });

    const unreadCount =
      await Notification.countDocuments({
        recipient: req.user.id,
        isRead: false
      });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const markNotificationAsRead = async (
  req,
  res
) => {
  try {
    const notification =
      await Notification.findOne({
        _id: req.params.id,
        recipient: req.user.id
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
      success: true,
      message:
        "Notification marked as read",
      notification
    });
  } catch (error) {
    console.error(
      "Mark notification error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const markAllNotificationsAsRead =
  async (req, res) => {
    try {
      await Notification.updateMany(
        {
          recipient: req.user.id,
          isRead: false
        },
        {
          $set: {
            isRead: true
          }
        }
      );

      res.status(200).json({
        success: true,
        message:
          "All notifications marked as read"
      });
    } catch (error) {
      console.error(
        "Mark all notifications error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  };

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};