import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Lock,
  User,
  RefreshCw,
  Search
} from "lucide-react";
import api from "../../services/api";

const Instructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/instructors");

      setInstructors(response.data.instructors || []);
    } catch (err) {
      console.error("Get instructors error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load instructors"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post(
        "/instructors",
        form
      );

      setSuccess(
        response.data.message ||
          "Instructor created successfully"
      );

      setForm({
        name: "",
        email: "",
        password: ""
      });

      fetchInstructors();
    } catch (err) {
      console.error("Create instructor error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to create instructor"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredInstructors = instructors.filter(
    (instructor) =>
      instructor.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      instructor.email
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Instructors
              </h1>

              <p className="text-sm text-slate-500">
                Manage instructors and their accounts
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchInstructors}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Add Instructor */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserPlus size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Add Instructor
              </h2>

              <p className="text-xs text-slate-500">
                Create a new instructor account
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Instructor name"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="instructor@example.com"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white py-2.5 font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              <UserPlus size={18} />

              {submitting
                ? "Creating..."
                : "Create Instructor"}
            </button>
          </form>
        </div>

        {/* Instructor List */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl">
          <div className="p-6 border-b border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  All Instructors
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {instructors.length} instructor
                  {instructors.length !== 1
                    ? "s"
                    : ""}{" "}
                  registered
                </p>
              </div>

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search instructors"
                  className="w-full md:w-64 rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading instructors...
            </div>
          ) : filteredInstructors.length === 0 ? (
            <div className="p-10 text-center">
              <Users
                size={40}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-slate-500">
                No instructors found
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredInstructors.map(
                (instructor, index) => (
                  <div
                    key={instructor._id}
                    className="p-5 flex items-center gap-4"
                  >
                    <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                      {instructor.name
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900">
                        {instructor.name}
                      </h3>

                      <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                        <Mail size={14} />
                        <span className="truncate">
                          {instructor.email}
                        </span>
                      </div>
                    </div>

                    <div className="hidden sm:block">
                      <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 px-3 py-1 text-xs font-medium">
                        Instructor
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Instructors;