import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import AdminLayout from "../../components/AdminLayout";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    instructors: 0,
    courses: 0,
    lectures: 0,
    upcomingLectures: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        instructorsResponse,
        coursesResponse,
        lecturesResponse
      ] = await Promise.all([
        api.get("/instructors"),
        api.get("/courses"),
        api.get("/lectures")
      ]);

      const lectures = lecturesResponse.data.lectures || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingLectures = lectures.filter(
        (lecture) => new Date(lecture.date) >= today
      );

      setStats({
        instructors:
          instructorsResponse.data.count || 0,

        courses:
          coursesResponse.data.count || 0,

        lectures:
          lecturesResponse.data.count || 0,

        upcomingLectures:
          upcomingLectures.length
      });

    } catch (error) {
      console.error("Dashboard stats error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load dashboard statistics"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const statCards = [
    {
      title: "Total Instructors",
      value: stats.instructors,
      icon: "👨‍🏫",
      description: "Registered instructors",
      path: "/admin/instructors"
    },
    {
      title: "Total Courses",
      value: stats.courses,
      icon: "📚",
      description: "Available courses",
      path: "/admin/courses"
    },
    {
      title: "Scheduled Lectures",
      value: stats.lectures,
      icon: "📅",
      description: "All scheduled lectures",
      path: "/admin/lectures"
    },
    {
      title: "Upcoming Lectures",
      value: stats.upcomingLectures,
      icon: "⏰",
      description: "Future lectures",
      path: "/admin/lectures"
    }
  ];

  return (
    <AdminLayout>

      {/* Header */}
      <header className="h-20 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-8">

        <div>
          <h2 className="text-xl font-semibold">
            Dashboard
          </h2>

          <p className="text-sm text-slate-400">
            Overview of your lecture scheduling system
          </p>
        </div>

        <button
          onClick={fetchDashboardStats}
          className="border border-slate-700 hover:bg-slate-800 px-4 py-2 rounded-lg text-sm transition"
        >
          Refresh
        </button>

      </header>

      {/* Content */}
      <div className="p-8">

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Welcome */}
        <div className="mb-8">

          <h1 className="text-3xl font-bold">
            Dashboard Overview
          </h1>

          <p className="text-slate-400 mt-2">
            Monitor instructors, courses and lecture schedules.
          </p>

        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

          {statCards.map((stat) => (
            <button
              key={stat.title}
              onClick={() => navigate(stat.path)}
              className="text-left bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/50 hover:bg-slate-900/80 transition"
            >

              <div className="flex items-center justify-between">

                <div className="w-11 h-11 bg-indigo-500/10 rounded-lg flex items-center justify-center text-xl">
                  {stat.icon}
                </div>

                <span className="text-slate-600">
                  →
                </span>

              </div>

              <p className="text-slate-400 text-sm mt-5">
                {stat.title}
              </p>

              <p className="text-3xl font-bold mt-1">

                {loading ? (
                  <span className="text-slate-600">
                    ...
                  </span>
                ) : (
                  stat.value
                )}

              </p>

              <p className="text-xs text-slate-500 mt-2">
                {stat.description}
              </p>

            </button>
          ))}

        </div>

        {/* Quick Actions */}
        <div className="mt-10">

          <h2 className="text-xl font-semibold mb-5">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <button
              onClick={() => navigate("/admin/instructors")}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 text-left transition"
            >
              <div className="text-2xl mb-4">
                👨‍🏫
              </div>

              <h3 className="font-semibold">
                Manage Instructors
              </h3>

              <p className="text-sm text-slate-400 mt-2">
                Add and view instructors.
              </p>
            </button>

            <button
              onClick={() => navigate("/admin/courses")}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 text-left transition"
            >
              <div className="text-2xl mb-4">
                📚
              </div>

              <h3 className="font-semibold">
                Manage Courses
              </h3>

              <p className="text-sm text-slate-400 mt-2">
                Create and view courses.
              </p>
            </button>

            <button
              onClick={() => navigate("/admin/lectures")}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 text-left transition"
            >
              <div className="text-2xl mb-4">
                📅
              </div>

              <h3 className="font-semibold">
                Schedule Lecture
              </h3>

              <p className="text-sm text-slate-400 mt-2">
                Assign courses to instructors.
              </p>
            </button>

          </div>

        </div>

      </div>

    </AdminLayout>
  );
};

export default AdminDashboard;