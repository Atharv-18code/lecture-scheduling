import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "../../components/AdminLayout";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    level: "",
    description: "",
    startDate: "",
    endDate: "",
    image: null
  });

  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        coursesResponse,
        lecturesResponse
      ] = await Promise.all([
        api.get("/courses"),
        api.get("/lectures")
      ]);

      setCourses(
        coursesResponse.data.courses || []
      );

      setLectures(
        lecturesResponse.data.lectures || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load course data"
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
      value,
      files
    } = e.target;

    if (name === "image") {
      const file = files?.[0] || null;

      setFormData({
        ...formData,
        image: file
      });

      if (file) {
        setPreview(
          URL.createObjectURL(file)
        );
      } else {
        setPreview("");
      }

      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });

    setError("");
    setSuccess("");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      level: "",
      description: "",
      startDate: "",
      endDate: "",
      image: null
    });

    setPreview("");
    setEditingCourse(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (
        new Date(formData.endDate) <
        new Date(formData.startDate)
      ) {
        setError(
          "End date cannot be before start date."
        );
        return;
      }

      const data = new FormData();

      data.append(
        "name",
        formData.name
      );

      data.append(
        "level",
        formData.level
      );

      data.append(
        "description",
        formData.description
      );

      data.append(
        "startDate",
        formData.startDate
      );

      data.append(
        "endDate",
        formData.endDate
      );

      if (formData.image) {
        data.append(
          "image",
          formData.image
        );
      }

      if (editingCourse) {
        await api.put(
          `/courses/${editingCourse._id}`,
          data
        );

        setSuccess(
          "Course updated successfully."
        );
      } else {
        await api.post(
          "/courses",
          data
        );

        setSuccess(
          "Course created successfully."
        );
      }

      resetForm();
      setShowForm(false);

      await fetchData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to save course"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);

    setFormData({
      name: course.name || "",
      level: course.level || "",
      description:
        course.description || "",
      startDate: course.startDate
        ? new Date(course.startDate)
            .toISOString()
            .split("T")[0]
        : "",
      endDate: course.endDate
        ? new Date(course.endDate)
            .toISOString()
            .split("T")[0]
        : "",
      image: null
    });

    setPreview(course.image || "");
    setShowForm(true);
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
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
    if (!date) {
      return "N/A";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  const getCourseLectures = (courseId) => {
    return lectures.filter(
      (lecture) =>
        lecture.course?._id === courseId
    );
  };

  const getCourseStatus = (course) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(
      course.startDate
    );
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(
      course.endDate
    );
    endDate.setHours(0, 0, 0, 0);

    if (today < startDate) {
      return {
        label: "Upcoming",
        className:
          "bg-blue-500/10 text-blue-400 border-blue-500/20"
      };
    }

    if (today > endDate) {
      return {
        label: "Completed",
        className:
          "bg-slate-500/10 text-slate-400 border-slate-500/20"
      };
    }

    return {
      label: "Active",
      className:
        "bg-green-500/10 text-green-400 border-green-500/20"
    };
  };

  const getAssignmentWarning = (course) => {
    const courseLectures =
      getCourseLectures(course._id);

    if (courseLectures.length > 0) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(
      course.startDate
    );
    startDate.setHours(0, 0, 0, 0);

    if (today < startDate) {
      return {
        type: "warning",
        message:
          "Instructor not assigned. Please assign an instructor before the course starts."
      };
    }

    return {
      type: "danger",
      message:
        "No instructor assigned to this course. Please assign an instructor immediately."
    };
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Courses
            </h1>

            <p className="text-slate-400 mt-1">
              Create and manage courses
            </p>
          </div>

          <button
            onClick={handleOpenForm}
            className="bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-lg font-medium transition"
          >
            {showForm
              ? "Close Form"
              : "+ Add Course"}
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
              {editingCourse
                ? "Edit Course"
                : "Add New Course"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Course Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Full Stack Development"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Level
                </label>

                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-indigo-500"
                >
                  <option value="">
                    Select Level
                  </option>

                  <option value="Beginner">
                    Beginner
                  </option>

                  <option value="Intermediate">
                    Intermediate
                  </option>

                  <option value="Advanced">
                    Advanced
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Start Date
                </label>

                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  End Date
                </label>

                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  min={
                    formData.startDate ||
                    undefined
                  }
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-slate-300 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter course description"
                  rows="5"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-slate-300 mb-2">
                  {editingCourse
                    ? "Replace Course Image"
                    : "Course Image"}
                </label>

                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white file:cursor-pointer"
                />

                <p className="text-xs text-slate-500 mt-2">
                  {editingCourse
                    ? "Leave empty to keep the current image."
                    : "Upload an image up to 5MB."}
                </p>
              </div>

              {preview && (
                <div className="md:col-span-2">
                  <p className="text-sm text-slate-300 mb-2">
                    Image Preview
                  </p>

                  <img
                    src={preview}
                    alt="Course preview"
                    className="w-full md:w-80 h-48 object-cover rounded-lg border border-slate-700"
                  />
                </div>
              )}

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-3 rounded-lg font-medium transition ${
                    submitting
                      ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  {submitting
                    ? "Saving..."
                    : editingCourse
                    ? "Update Course"
                    : "Create Course"}
                </button>

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
              </div>
            </form>
          </div>
        )}

        <div className="mb-5">
          <h2 className="text-xl font-semibold">
            All Courses
          </h2>

          <p className="text-slate-400 text-sm mt-1">
            {courses.length} course
            {courses.length !== 1
              ? "s"
              : ""} available
          </p>
        </div>

        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
            <p className="text-slate-400">
              No courses available.
            </p>

            <button
              onClick={() =>
                setShowForm(true)
              }
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-lg font-medium transition"
            >
              Add Your First Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((course) => {
              const status =
                getCourseStatus(course);

              const warning =
                getAssignmentWarning(course);

              const courseLectures =
                getCourseLectures(
                  course._id
                );

              return (
                <div
                  key={course._id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition"
                >
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <div className="w-full h-48 bg-slate-800 rounded-lg mb-4 flex items-center justify-center text-slate-500">
                      No Image
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg font-semibold">
                      {course.name}
                    </h3>

                    <span
                      className={`shrink-0 text-xs border px-2.5 py-1 rounded-full ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <span className="inline-block text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full mb-4">
                    {course.level}
                  </span>

                  <p className="text-slate-400 text-sm leading-6 mb-4">
                    {course.description}
                  </p>

                  <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                    <p className="text-xs text-slate-500 mb-1">
                      Course Duration
                    </p>

                    <p className="text-sm text-slate-200">
                      {formatDate(
                        course.startDate
                      )}{" "}
                      →{" "}
                      {formatDate(
                        course.endDate
                      )}
                    </p>
                  </div>

                  {warning && (
                    <div
                      className={`rounded-lg p-3 mb-4 border ${
                        warning.type ===
                        "danger"
                          ? "bg-red-500/10 border-red-500/20 text-red-400"
                          : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      <p className="text-xs leading-5">
                        {warning.message}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <div>
                      <p className="text-xs text-slate-500">
                        Scheduled Lectures
                      </p>

                      <p className="text-sm font-medium text-slate-200 mt-1">
                        {courseLectures.length}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        handleEdit(course)
                      }
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-sm font-medium transition"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Courses;