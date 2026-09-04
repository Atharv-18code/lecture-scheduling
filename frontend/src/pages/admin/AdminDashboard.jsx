import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  CalendarDays,
  Clock,
  Bell,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    instructors: 0,
    courses: 0,
    lectures: 0,
    upcoming: 0
  });

  const [lectures, setLectures] = useState([]);
  const [unreadNotifications, setUnreadNotifications] =
    useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        instructorsResponse,
        coursesResponse,
        lecturesResponse,
        notificationsResponse
      ] = await Promise.all([
        api.get("/instructors"),
        api.get("/courses"),
        api.get("/lectures"),
        api.get("/notifications")
      ]);

      const instructors =
        instructorsResponse.data.instructors || [];

      const courses =
        coursesResponse.data.courses || [];

      const allLectures =
        lecturesResponse.data.lectures || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingLectures = allLectures.filter(
        (lecture) =>
          new Date(lecture.date) >= today &&
          lecture.status === "scheduled"
      );

      setStats({
        instructors: instructors.length,
        courses: courses.length,
        lectures: allLectures.length,
        upcoming: upcomingLectures.length
      });

      setLectures(
        upcomingLectures.slice(0, 5)
      );

      setUnreadNotifications(
        notificationsResponse.data.unreadCount || 0
      );
    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );
    } finally {
      setLoading(false);
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

  const statCards = [
    {
      title: "Total Instructors",
      value: stats.instructors,
      icon: Users,
      link: "/admin/instructors"
    },
    {
      title: "Total Courses",
      value: stats.courses,
      icon: BookOpen,
      link: "/admin/courses"
    },
    {
      title: "Scheduled Lectures",
      value: stats.lectures,
      icon: CalendarDays,
      link: "/admin/lectures"
    },
    {
      title: "Upcoming Lectures",
      value: stats.upcoming,
      icon: Clock,
      link: "/admin/lectures"
    }
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="text-slate-500 mt-1">
            Manage courses, instructors and lecture schedules.
          </p>
        </div>

        <Link
          to="/admin/notifications"
          className="relative flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition"
        >
          <Bell size={18} />

          <span>Notifications</span>

          {unreadNotifications > 0 && (
            <span className="min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadNotifications}
            </span>
          )}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              to={card.link}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {card.title}
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {loading ? "—" : card.value}
                  </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Icon size={21} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Upcoming Lectures
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Next scheduled lectures
            </p>
          </div>

          <Link
            to="/admin/lectures"
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
          >
            View all
            <ArrowRight size={15} />
          </Link>
        </div>

        {lectures.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarDays
              size={40}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-slate-500">
              No upcoming lectures
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {lectures.map((lecture) => (
              <div
                key={lecture._id}
                className="p-5 flex items-center justify-between gap-5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <BookOpen size={20} />
                  </div>

                  <div>
                    <h3 className="font-medium text-slate-900">
                      {lecture.course?.name ||
                        lecture.title}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {lecture.instructor?.name ||
                        "Unassigned"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">
                    {formatDate(lecture.date)}
                  </p>

                  <p className="text-sm text-slate-500">
                    {formatTime(
                      lecture.startTime
                    )}{" "}
                    -{" "}
                    {formatTime(
                      lecture.endTime
                    )}
                  </p>
                </div>

                <div className="hidden lg:flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
                  <CheckCircle2 size={14} />
                  Scheduled
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;