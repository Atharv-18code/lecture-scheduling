import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  Clock,
  User,
  Image as ImageIcon
} from "lucide-react";

import api from "../../services/api";


const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];


const emptyForm = {
  name: "",
  level: "Beginner",
  description: "",
  startDate: "",
  endDate: "",
  weeklyDays: [],
  startTime: "",
  endTime: "",
  instructor: "",
  image: null
};


const Courses = () => {

  const [courses, setCourses] =
    useState([]);

  const [instructors, setInstructors] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingCourse, setEditingCourse] =
    useState(null);

  const [form, setForm] =
    useState(emptyForm);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  // ------------------------------------------------
  // FETCH DATA
  // ------------------------------------------------

  const fetchData = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        coursesResponse,
        instructorsResponse
      ] = await Promise.all([
        api.get("/courses"),
        api.get("/instructors")
      ]);

      setCourses(
        coursesResponse.data.courses || []
      );

      setInstructors(
        instructorsResponse.data.instructors || []
      );

    } catch (error) {

      console.error(
        "Fetch courses error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to load courses"
      );

    } finally {

      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);


  // ------------------------------------------------
  // OPEN CREATE
  // ------------------------------------------------

  const openCreateModal = () => {

    setEditingCourse(null);

    setForm({
      ...emptyForm
    });

    setError("");

    setShowModal(true);
  };


  // ------------------------------------------------
  // OPEN EDIT
  // ------------------------------------------------

  const openEditModal = (course) => {

    setEditingCourse(course);

    setForm({
      name: course.name || "",

      level:
        course.level ||
        "Beginner",

      description:
        course.description || "",

      startDate:
        course.startDate
          ? course.startDate.substring(0, 10)
          : "",

      endDate:
        course.endDate
          ? course.endDate.substring(0, 10)
          : "",

      weeklyDays:
        course.weeklyDays ||
        course.scheduleDays ||
        [],

      startTime:
        course.startTime || "",

      endTime:
        course.endTime || "",

      instructor:
        course.instructor?._id ||
        course.instructor ||
        "",

      image: null
    });

    setError("");

    setShowModal(true);
  };


  // ------------------------------------------------
  // CLOSE MODAL
  // ------------------------------------------------

  const closeModal = () => {

    if (saving) {
      return;
    }

    setShowModal(false);

    setEditingCourse(null);

    setForm({
      ...emptyForm
    });

    setError("");
  };


  // ------------------------------------------------
  // HANDLE INPUT
  // ------------------------------------------------

  const handleChange = (e) => {

    const {
      name,
      value,
      files
    } = e.target;

    if (name === "image") {

      setForm((previous) => ({
        ...previous,
        image:
          files?.[0] || null
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };


  // ------------------------------------------------
  // HANDLE WEEKLY DAY
  // ------------------------------------------------

  const toggleDay = (day) => {

    setForm((previous) => {

      const alreadySelected =
        previous.weeklyDays.includes(day);

      return {
        ...previous,

        weeklyDays: alreadySelected
          ? previous.weeklyDays.filter(
              (item) => item !== day
            )
          : [
              ...previous.weeklyDays,
              day
            ]
      };
    });
  };


  // ------------------------------------------------
  // VALIDATION
  // ------------------------------------------------

  const validateForm = () => {

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.startDate ||
      !form.endDate ||
      !form.startTime ||
      !form.endTime ||
      !form.instructor
    ) {
      return "Please fill all required fields.";
    }


    if (
      form.weeklyDays.length === 0
    ) {
      return "Select at least one weekly day.";
    }


    if (
      form.endDate <
      form.startDate
    ) {
      return "End date cannot be before start date.";
    }


    if (
      form.startTime >=
      form.endTime
    ) {
      return "End time must be after start time.";
    }


    return "";
  };


  // ------------------------------------------------
  // SAVE COURSE
  // ------------------------------------------------

  const handleSubmit = async (e) => {

    e.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {

      setError(validationError);

      return;
    }


    try {

      setSaving(true);
      setError("");


      const formData =
        new FormData();


      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "level",
        form.level
      );

      formData.append(
        "description",
        form.description.trim()
      );

      formData.append(
        "startDate",
        form.startDate
      );

      formData.append(
        "endDate",
        form.endDate
      );

      formData.append(
        "weeklyDays",
        JSON.stringify(
          form.weeklyDays
        )
      );

      formData.append(
        "startTime",
        form.startTime
      );

      formData.append(
        "endTime",
        form.endTime
      );

      formData.append(
        "instructor",
        form.instructor
      );


      // --------------------------------
      // IMAGE IS OPTIONAL
      // --------------------------------

      if (form.image) {

        formData.append(
          "image",
          form.image
        );
      }


      // --------------------------------
      // CREATE / UPDATE
      // --------------------------------

      if (editingCourse) {

        await api.put(
          `/courses/${editingCourse._id}`,
          formData
        );

      } else {

        await api.post(
          "/courses",
          formData
        );
      }


      // --------------------------------
      // REFRESH
      // --------------------------------

      await fetchData();

      closeModal();

    } catch (error) {

      console.error(
        "Save course error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to save course"
      );

    } finally {

      setSaving(false);
    }
  };


  // ------------------------------------------------
  // DELETE COURSE
  // ------------------------------------------------

  const handleDelete = async (course) => {

    const confirmed =
      window.confirm(
        `Delete "${course.name}"?`
      );

    if (!confirmed) {
      return;
    }


    try {

      await api.delete(
        `/courses/${course._id}`
      );

      await fetchData();

    } catch (error) {

      console.error(
        "Delete course error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to delete course"
      );
    }
  };


  // ------------------------------------------------
  // FILTER
  // ------------------------------------------------

  const filteredCourses =
    courses.filter((course) => {

      const query =
        search.toLowerCase();

      return (
        course.name
          ?.toLowerCase()
          .includes(query) ||

        course.level
          ?.toLowerCase()
          .includes(query) ||

        course.instructor?.name
          ?.toLowerCase()
          .includes(query)
      );
    });


  // ------------------------------------------------
  // FORMAT DATE
  // ------------------------------------------------

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    return new Date(date)
      .toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      );
  };


  // ------------------------------------------------
  // UI
  // ------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Courses
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage courses and their weekly lecture schedules.
          </p>
        </div>


        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus size={18} />

          Add Course
        </button>

      </div>


      {/* SEARCH */}

      <div className="mb-6">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gray-400"
          />

        </div>

      </div>


      {/* ERROR */}

      {error && !showModal && (

        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>

      )}


      {/* LOADING */}

      {loading ? (

        <div className="rounded-xl bg-white p-10 text-center text-gray-500">
          Loading courses...
        </div>

      ) : filteredCourses.length === 0 ? (

        <div className="rounded-xl bg-white p-10 text-center">

          <CalendarDays
            size={40}
            className="mx-auto mb-3 text-gray-400"
          />

          <p className="font-medium text-gray-800">
            No courses found
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Create your first course to start scheduling lectures.
          </p>

        </div>

      ) : (

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="border-b border-gray-200 bg-gray-50">

                <tr>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Course
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Instructor
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Schedule
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Duration
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-100">

                {filteredCourses.map(
                  (course) => (

                    <tr
                      key={course._id}
                      className="hover:bg-gray-50"
                    >

                      {/* COURSE */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          {course.image ? (

                            <img
                              src={course.image}
                              alt={course.name}
                              className="h-12 w-12 rounded-lg object-cover"
                            />

                          ) : (

                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">

                              <ImageIcon
                                size={20}
                                className="text-gray-400"
                              />

                            </div>

                          )}


                          <div>

                            <p className="font-semibold text-gray-900">
                              {course.name}
                            </p>

                            <p className="text-sm text-gray-500">
                              {course.level}
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* INSTRUCTOR */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <User
                            size={16}
                            className="text-gray-400"
                          />

                          <div>

                            <p className="text-sm font-medium text-gray-800">
                              {course.instructor?.name ||
                                "Unknown"}
                            </p>

                            <p className="text-xs text-gray-500">
                              {course.instructor?.email ||
                                ""}
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* SCHEDULE */}

                      <td className="px-5 py-4">

                        <div className="flex flex-wrap gap-1">

                          {(course.weeklyDays ||
                            course.scheduleDays ||
                            []).map(
                              (day) => (

                                <span
                                  key={day}
                                  className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700"
                                >
                                  {day.substring(
                                    0,
                                    3
                                  )}
                                </span>

                              )
                            )}

                        </div>

                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">

                          <Clock size={13} />

                          {course.startTime}
                          {" - "}
                          {course.endTime}

                        </div>

                      </td>


                      {/* DURATION */}

                      <td className="px-5 py-4">

                        <div className="text-sm text-gray-700">

                          {formatDate(
                            course.startDate
                          )}

                        </div>

                        <div className="text-xs text-gray-500">

                          to{" "}

                          {formatDate(
                            course.endDate
                          )}

                        </div>

                      </td>


                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              openEditModal(
                                course
                              )
                            }
                            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                            title="Edit course"
                          >
                            <Pencil size={16} />
                          </button>


                          <button
                            onClick={() =>
                              handleDelete(
                                course
                              )
                            }
                            className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                            title="Delete course"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}


      {/* MODAL */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">

              <div>

                <h2 className="text-lg font-semibold text-gray-900">

                  {editingCourse
                    ? "Edit Course"
                    : "Create Course"}

                </h2>

                <p className="text-sm text-gray-500">
                  Configure the course and weekly schedule.
                </p>

              </div>


              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              {/* MODAL ERROR */}

              {error && (

                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>

              )}


              {/* NAME */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Course Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. MERN Stack Development"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                />

              </div>


              {/* LEVEL */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Level
                </label>

                <select
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none"
                >

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


              {/* DESCRIPTION */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Course description..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                />

              </div>


              {/* INSTRUCTOR */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Instructor
                </label>

                <select
                  name="instructor"
                  value={form.instructor}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none"
                >

                  <option value="">
                    Select instructor
                  </option>

                  {instructors.map(
                    (instructor) => (

                      <option
                        key={instructor._id}
                        value={
                          instructor._id
                        }
                      >
                        {instructor.name}
                        {" - "}
                        {instructor.email}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* DATES */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                  />

                </div>


                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    End Date
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                  />

                </div>

              </div>


              {/* WEEKLY DAYS */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Weekly Days
                </label>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

                  {DAYS.map((day) => {

                    const selected =
                      form.weeklyDays.includes(
                        day
                      );

                    return (

                      <button
                        type="button"
                        key={day}
                        onClick={() =>
                          toggleDay(day)
                        }
                        className={`rounded-lg border px-3 py-2 text-sm ${
                          selected
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {day}
                      </button>

                    );

                  })}

                </div>

              </div>


              {/* TIME */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Start Time
                  </label>

                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                  />

                </div>


                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    End Time
                  </label>

                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                  />

                </div>

              </div>


              {/* IMAGE */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700">

                  Course Image

                  <span className="ml-2 font-normal text-gray-400">
                    (Optional)
                  </span>

                </label>

                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                />

                <p className="mt-1 text-xs text-gray-400">
                  You can create the course without uploading an image.
                </p>

              </div>


              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {saving
                    ? "Saving..."
                    : editingCourse
                    ? "Update Course"
                    : "Create Course"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};


export default Courses;