import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "../../components/AdminLayout";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    level: "",
    description: "",
    image: null
  });

  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/courses");

      setCourses(response.data.courses || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load courses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files?.[0] || null;

      setFormData({
        ...formData,
        image: file
      });

      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setPreview(imageUrl);
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
      image: null
    });

    setPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const data = new FormData();

      data.append("name", formData.name);
      data.append("level", formData.level);
      data.append("description", formData.description);

      if (formData.image) {
        data.append("image", formData.image);
      }

      await api.post("/courses", data);

      setSuccess("Course created successfully.");

      resetForm();

      setShowForm(false);

      await fetchCourses();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create course"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenForm = () => {
    setShowForm(!showForm);
    setError("");
    setSuccess("");
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
            {showForm ? "Close Form" : "+ Add Course"}
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
              Add New Course
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
                  Course Image
                </label>

                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white file:cursor-pointer"
                />

                <p className="text-xs text-slate-500 mt-2">
                  Upload an image up to 5MB.
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
                    ? "Creating Course..."
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

        <div>
          <div className="mb-5">
            <h2 className="text-xl font-semibold">
              All Courses
            </h2>

            <p className="text-slate-400 text-sm mt-1">
              {courses.length} course
              {courses.length !== 1 ? "s" : ""} available
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
                onClick={() => setShowForm(true)}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-lg font-medium transition"
              >
                Add Your First Course
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => (
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

                    <span className="shrink-0 text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                      {course.level}
                    </span>
                  </div>

                  <p className="text-slate-400 text-sm leading-6">
                    {course.description}
                  </p>

                  <div className="mt-5 pt-4 border-t border-slate-800">
                    <p className="text-xs text-slate-500">
                      Created{" "}
                      {course.createdAt
                        ? new Date(
                            course.createdAt
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            }
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Courses;