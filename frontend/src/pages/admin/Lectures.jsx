import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "../../components/AdminLayout";

const Lectures = () => {
  const [lectures, setLectures] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLecture, setEditingLecture] =
    useState(null);

  const [formData, setFormData] = useState({
    title: "",
    course: "",
    instructor: "",
    date: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        lecturesResponse,
        coursesResponse,
        instructorsResponse
      ] = await Promise.all([
        api.get("/lectures"),
        api.get("/courses"),
        api.get("/instructors")
      ]);

      setLectures(
        lecturesResponse.data.lectures || []
      );

      setCourses(
        coursesResponse.data.courses || []
      );

      setInstructors(
        instructorsResponse.data.instructors ||
          []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load lecture scheduling data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const {
      name,
      value
    } = e.target;

    if (name === "course") {
      setFormData({
        ...formData,
        course: value,
        date: ""
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    setError("");
    setSuccess("");
  };

  const selectedCourse = courses.find(
    (course) =>
      course._id === formData.course
  );

  const getInstructorLectures = () => {
    if (!formData.instructor) {
      return [];
    }

    return lectures
      .filter(
        (lecture) =>
          lecture.instructor?._id ===
          formData.instructor &&
          lecture._id !==
            editingLecture?._id
      )
      .sort(
        (a, b) =>
          new Date(a.date) -
          new Date(b.date)
      );
  };

  const isDateBooked = () => {
    if (
      !formData.instructor ||
      !formData.date
    ) {
      return false;
    }

    return lectures.some((lecture) => {
      if (!lecture.instructor?._id) {
        return false;
      }

      if (
        editingLecture &&
        lecture._id === editingLecture._id
      ) {
        return false;
      }

      const lectureDate =
        new Date(lecture.date)
          .toISOString()
          .split("T")[0];

      return (
        lecture.instructor._id ===
          formData.instructor &&
        lectureDate === formData.date
      );
    });
  };

  const isDateOutsideCourseRange = () => {
    if (
      !selectedCourse ||
      !formData.date
    ) {
      return false;
    }

    const selectedDate = new Date(
      `${formData.date}T00:00:00`
    );

    const startDate = new Date(
      selectedCourse.startDate
    );

    const endDate = new Date(
      selectedCourse.endDate
    );

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    return (
      selectedDate < startDate ||
      selectedDate > endDate
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");

      if (isDateOutsideCourseRange()) {
        setError(
          "Lecture date must be within the course start and end dates."
        );
        return;
      }

      if (isDateBooked()) {
        setError(
          "This instructor already has a lecture scheduled on this date."
        );
        return;
      }

      if (editingLecture) {
        await api.put(
          `/lectures/${editingLecture._id}`,
          formData
        );

        setSuccess(
          "Lecture updated successfully."
        );
      } else {
        await api.post(
          "/lectures",
          formData
        );

        setSuccess(
          "Lecture scheduled successfully."
        );
      }

      resetForm();

      setShowForm(false);

      await fetchData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to save lecture"
      );
    }
  };

  const handleEdit = (lecture) => {
    setEditingLecture(lecture);

    setFormData({
      title: lecture.title || "",
      course:
        lecture.course?._id || "",
      instructor:
        lecture.instructor?._id || "",
      date: lecture.date
        ? new Date(lecture.date)
            .toISOString()
            .split("T")[0]
        : ""
    });

    setShowForm(true);
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      course: "",
      instructor: "",
      date: ""
    });

    setEditingLecture(null);
  };

  const handleOpenForm = () => {
    if (showForm) {
      resetForm();
    }

    setShowForm(!showForm);
    setError("");
    setSuccess("");
  };

  const formatDate = (date) => {
    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Lecture Scheduling
            </h1>

            <p className="text-slate-400 mt-1">
              Schedule and manage lectures
            </p>
          </div>

          <button
            onClick={handleOpenForm}
            className="bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-lg font-medium transition"
          >
            {showForm
              ? "Close Form"
              : "+ Schedule Lecture"}
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {showForm && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">
              {editingLecture
                ? "Edit Lecture"
                : "Schedule New Lecture"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Lecture Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. React Fundamentals"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Course
                </label>

                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-indigo-500"
                >
                  <option value="">
                    Select Course
                  </option>

                  {courses.map(
                    (course) => (
                      <option
                        key={course._id}
                        value={course._id}
                      >
                        {course.name} -{" "}
                        {course.level}
                      </option>
                    )
                  )}
                </select>

                {selectedCourse && (
                  <p className="mt-2 text-xs text-slate-400">
                    Course period:{" "}
                    {formatDate(
                      selectedCourse.startDate
                    )}{" "}
                    →{" "}
                    {formatDate(
                      selectedCourse.endDate
                    )}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Instructor
                </label>

                <select
                  name="instructor"
                  value={
                    formData.instructor
                  }
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-indigo-500"
                >
                  <option value="">
                    Select Instructor
                  </option>

                  {instructors.map(
                    (instructor) => (
                      <option
                        key={instructor._id}
                        value={instructor._id}
                      >
                        {instructor.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Lecture Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  min={
                    selectedCourse?.startDate
                      ? new Date(
                          selectedCourse.startDate
                        )
                          .toISOString()
                          .split("T")[0]
                      : undefined
                  }
                  max={
                    selectedCourse?.endDate
                      ? new Date(
                          selectedCourse.endDate
                        )
                          .toISOString()
                          .split("T")[0]
                      : undefined
                  }
                  onChange={handleChange}
                  disabled={!selectedCourse}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 disabled:opacity-50"
                />

                {!selectedCourse && (
                  <p className="mt-2 text-xs text-slate-500">
                    Select a course first.
                  </p>
                )}

                {selectedCourse &&
                  formData.date &&
                  isDateOutsideCourseRange() && (
                    <p className="mt-2 text-sm text-red-400">
                      Date must be within the course period.
                    </p>
                  )}

                {formData.instructor &&
                  formData.date &&
                  isDateBooked() && (
                    <p className="mt-2 text-sm text-red-400">
                      This instructor is already assigned on this date.
                    </p>
                  )}
              </div>

              {formData.instructor &&
                getInstructorLectures()
                  .length > 0 && (
                  <div className="md:col-span-2 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-300 mb-3">
                      Existing dates for this instructor
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {getInstructorLectures().map(
                        (lecture) => (
                          <span
                            key={lecture._id}
                            className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-full"
                          >
                            {formatDate(
                              lecture.date
                            )}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={
                    isDateBooked() ||
                    isDateOutsideCourseRange() ||
                    !selectedCourse
                  }
                  className={`px-6 py-3 rounded-lg font-medium transition ${
                    isDateBooked() ||
                    isDateOutsideCourseRange() ||
                    !selectedCourse
                      ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  {isDateBooked()
                    ? "Date Already Booked"
                    : isDateOutsideCourseRange()
                    ? "Invalid Course Date"
                    : editingLecture
                    ? "Update Lecture"
                    : "Schedule Lecture"}
                </button>

                {editingLecture && (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                      setError("");
                    }}
                    className="px-6 py-3 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-semibold">
              Scheduled Lectures
            </h2>

            <p className="text-slate-400 text-sm mt-1">
              {lectures.length} lecture
              {lectures.length !== 1
                ? "s"
                : ""} scheduled
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">
              Loading lectures...
            </div>
          ) : lectures.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No lectures scheduled yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Lecture
                    </th>

                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Course
                    </th>

                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Instructor
                    </th>

                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Date
                    </th>

                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {lectures.map(
                    (lecture) => (
                      <tr
                        key={lecture._id}
                        className="border-t border-slate-800 hover:bg-slate-800/40 transition"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium">
                            {lecture.title}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p>
                            {lecture.course
                              ?.name ||
                              "N/A"}
                          </p>

                          {lecture.course
                            ?.level && (
                            <span className="text-xs text-slate-400">
                              {
                                lecture
                                  .course
                                  .level
                              }
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <p>
                            {lecture
                              .instructor
                              ?.name ||
                              "N/A"}
                          </p>

                          {lecture
                            .instructor
                            ?.email && (
                            <p className="text-xs text-slate-400">
                              {
                                lecture
                                  .instructor
                                  .email
                              }
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4 text-slate-300">
                          {formatDate(
                            lecture.date
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              handleEdit(
                                lecture
                              )
                            }
                            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-sm font-medium transition"
                          >
                            ✏️ Edit
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Lectures;