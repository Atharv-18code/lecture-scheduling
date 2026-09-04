import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  CalendarDays,
  User,
  Clock,
  Inbox
} from "lucide-react";
import api from "../../services/api";

const Notifications = () => {
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response =
        await api.get("/notifications");

      setNotifications(
        response.data.notifications || []
      );
    } catch (error) {
      console.error(
        "Notification error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(
        `/notifications/${id}/read`
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === id
            ? {
                ...notification,
                isRead: true
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Mark read error:",
        error
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch(
        "/notifications/read-all"
      );

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true
        }))
      );
    } catch (error) {
      console.error(
        "Mark all read error:",
        error
      );
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(
      "en-US",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  const formatTime = (time) => {
    if (!time) return "";

    const [hour, minute] =
      time.split(":").map(Number);

    const date = new Date();

    date.setHours(hour);
    date.setMinutes(minute);

    return date.toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit"
      }
    );
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Notifications
          </h1>

          <p className="text-slate-500 mt-1">
            Review instructor requests and system updates.
          </p>
        </div>

        {notifications.some(
          (notification) =>
            !notification.isRead
        ) && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition text-sm"
          >
            <CheckCheck size={17} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox size={40} />
            <h3 className="mt-4 font-medium text-slate-800">
              No notifications
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              New instructor requests will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map(
              (notification) => {
                const lecture =
                  notification.lecture;

                return (
                  <div
                    key={notification._id}
                    className={`p-6 ${
                      !notification.isRead
                        ? "bg-indigo-50/40"
                        : ""
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Bell size={20} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {notification.title}
                            </h3>

                            <p className="text-sm text-slate-600 mt-1">
                              {notification.message}
                            </p>
                          </div>

                          {!notification.isRead && (
                            <span className="text-xs bg-indigo-600 text-white px-2.5 py-1 rounded-full">
                              New
                            </span>
                          )}
                        </div>

                        {lecture && (
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <BookIcon />
                              <span>
                                {lecture.course
                                  ?.name ||
                                  lecture.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <User size={16} />
                              <span>
                                {lecture.instructor
                                  ?.name ||
                                  notification.sender
                                    ?.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <CalendarDays
                                size={16}
                              />
                              <span>
                                {formatDate(
                                  lecture.date
                                )}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Clock size={16} />
                              <span>
                                {formatTime(
                                  lecture.startTime
                                )}{" "}
                                -{" "}
                                {formatTime(
                                  lecture.endTime
                                )}
                              </span>
                            </div>
                          </div>
                        )}

                        {!notification.isRead && (
                          <button
                            onClick={() =>
                              markAsRead(
                                notification._id
                              )
                            }
                            className="mt-4 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                          >
                            <Check size={16} />
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const BookIcon = () => (
  <BookOpenIcon />
);

const BookOpenIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 7v14" />
    <path d="M3 18a4 4 0 0 1 4-4h5" />
    <path d="M21 18a4 4 0 0 0-4-4h-5" />
    <path d="M3 18V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v2" />
    <path d="M21 18V5a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2v2" />
  </svg>
);

export default Notifications;