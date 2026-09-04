import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  User,
  BookOpen,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import api from "../../services/api";

const Lectures = () => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchLectures = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/lectures");

      setLectures(response.data.lectures || []);
    } catch (err) {
      console.error("Get lectures error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load lectures"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  const formatTime = (time) => {
    if (!time) return "-";

    const [hour, minute] =
      time.split(":").map(Number);

    const date = new Date();

    date.setHours(hour);
    date.setMinutes(minute);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit"
    });
  };

  const filteredLectures = lectures.filter(
    (lecture) => {
      const searchValue =
        search.toLowerCase();

      const matchesSearch =
        lecture.title
          ?.toLowerCase()
          .includes(searchValue) ||
        lecture.course?.name
          ?.toLowerCase()
          .includes(searchValue) ||
        lecture.instructor?.name
          ?.toLowerCase()
          .includes(searchValue);

      const matchesFilter =
        filter === "all" ||
        lecture.status === filter ||
        lecture.type === filter;

      return (
        matchesSearch && matchesFilter
      );
    }
  );

  const getStatusStyle = (status) => {
    if (status === "scheduled") {
      return "bg-green-50 text-green-700";
    }

    if (status === "pending") {
      return "bg-yellow-50 text-yellow-700";
    }

    if (status === "rejected") {
      return "bg-red-50 text-red-700";
    }

    return "bg-slate-100 text-slate-600";
  };

  const getStatusIcon = (status) => {
    if (status === "scheduled") {
      return <CheckCircle2 size={14} />;
    }

    return <AlertCircle size={14} />;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarDays size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Lectures
              </h1>

              <p className="text-sm text-slate-500">
                View all scheduled course lectures
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchLectures}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="relative lg:w-96">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search lectures, courses or instructors..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All" },
              {
                value: "scheduled",
                label: "Scheduled"
              },
              {
                value: "pending",
                label: "Pending"
              },
              {
                value: "rejected",
                label: "Rejected"
              },
              {
                value: "extra",
                label: "Extra"
              }
            ].map((item) => (
              <button
                key={item.value}
                onClick={() =>
                  setFilter(item.value)
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === item.value
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
          Loading lectures...
        </div>
      ) : filteredLectures.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <CalendarDays
            size={45}
            className="mx-auto text-slate-300"
          />

          <p className="mt-4 text-slate-500">
            No lectures found
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Course
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Instructor
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Date
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Time
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Type
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredLectures.map(
                  (lecture) => (
                    <tr
                      key={lecture._id}
                      className="hover:bg-slate-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <BookOpen
                              size={17}
                            />
                          </div>

                          <div>
                            <p className="font-medium text-slate-900">
                              {lecture.course
                                ?.name ||
                                lecture.title}
                            </p>

                            {lecture.course
                              ?.level && (
                              <p className="text-xs text-slate-500">
                                {
                                  lecture.course
                                    .level
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User size={15} />

                          {lecture.instructor
                            ?.name ||
                            "Unassigned"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays
                            size={15}
                          />

                          {formatDate(
                            lecture.date
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock size={15} />

                          {formatTime(
                            lecture.startTime
                          )}
                          {" - "}
                          {formatTime(
                            lecture.endTime
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            lecture.type ===
                            "extra"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {lecture.type ===
                          "extra"
                            ? "Extra"
                            : "Regular"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                            lecture.status
                          )}`}
                        >
                          {getStatusIcon(
                            lecture.status
                          )}

                          {lecture.status
                            ?.charAt(0)
                            .toUpperCase() +
                            lecture.status?.slice(
                              1
                            )}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden divide-y divide-slate-100">
            {filteredLectures.map(
              (lecture) => (
                <div
                  key={lecture._id}
                  className="p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <BookOpen
                          size={18}
                        />
                      </div>

                      <div>
                        <h3 className="font-medium text-slate-900">
                          {lecture.course
                            ?.name ||
                            lecture.title}
                        </h3>

                        <p className="text-xs text-slate-500">
                          {lecture.instructor
                            ?.name ||
                            "Unassigned"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                        lecture.status
                      )}`}
                    >
                      {getStatusIcon(
                        lecture.status
                      )}

                      {lecture.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        size={15}
                      />

                      {formatDate(
                        lecture.date
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock size={15} />

                      {formatTime(
                        lecture.startTime
                      )}
                      {" - "}
                      {formatTime(
                        lecture.endTime
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Lectures;