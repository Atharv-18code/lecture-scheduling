import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const InstructorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyLectures = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/instructors/me/lectures");

      setLectures(response.data.lectures);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load your lectures"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLectures();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <header className="border-b border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between px-8 py-5">

          <div>
            <h1 className="text-2xl font-bold">
              Lecture Scheduler
            </h1>

            <p className="text-sm text-slate-400">
              Instructor Portal
            </p>
          </div>

          <div className="flex items-center gap-5">

            <div className="text-right">
              <p className="font-medium">
                {user?.name}
              </p>

              <p className="text-sm text-slate-400">
                {user?.email}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="border border-slate-700 hover:bg-slate-800 px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>

          </div>

        </div>
      </header>

      <main className="p-8">

        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Welcome, {user?.name}
          </h2>

          <p className="text-slate-400 mt-2">
            Here are the lectures assigned to you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <p className="text-slate-400 text-sm">
              Total Lectures
            </p>

            <p className="text-3xl font-bold mt-2">
              {lectures.length}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <p className="text-slate-400 text-sm">
              Upcoming Lectures
            </p>

            <p className="text-3xl font-bold mt-2">
              {
                lectures.filter(
                  (lecture) =>
                    new Date(lecture.date) >= new Date()
                ).length
              }
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <p className="text-slate-400 text-sm">
              Instructor
            </p>

            <p className="text-xl font-semibold mt-2">
              {user?.name}
            </p>
          </div>

        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">

          <div className="p-6 border-b border-slate-800">
            <h3 className="text-xl font-semibold">
              My Lectures
            </h3>

            <p className="text-sm text-slate-400 mt-1">
              Your assigned courses and lecture dates
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-400">
              Loading your lectures...
            </div>
          ) : lectures.length === 0 ? (
            <div className="p-10 text-center">

              <div className="text-5xl mb-4">
                ðŸ“š
              </div>

              <h4 className="text-lg font-semibold">
                No lectures assigned
              </h4>

              <p className="text-slate-400 mt-2">
                You don't have any lectures scheduled yet.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-slate-800">

              {lectures.map((lecture) => (
                <div
                  key={lecture._id}
                  className="p-6 hover:bg-slate-800/40 transition"
                >

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                    <div>
                      <h4 className="text-lg font-semibold">
                        {lecture.title}
                      </h4>

                      <p className="text-indigo-400 mt-1">
                        {lecture.course?.name || "Course"}
                      </p>

                      {lecture.course?.level && (
                        <span className="inline-block mt-2 text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
                          {lecture.course.level}
                        </span>
                      )}
                    </div>

                    <div className="text-left md:text-right">

                      <p className="text-sm text-slate-400">
                        Lecture Date
                      </p>

                      <p className="text-lg font-semibold mt-1">
                        {formatDate(lecture.date)}
                      </p>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </main>

    </div>
  );
};

export default InstructorDashboard;
