import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "../../components/AdminLayout";

const Instructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchInstructors = async () => {
    try {
      setLoading(true);

      const response = await api.get("/instructors");

      setInstructors(response.data.instructors);
    } catch (error) {
      setError(
        error.response?.data?.message ||
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");

      await api.post("/instructors", formData);

      setSuccess("Instructor created successfully");

      setFormData({
        name: "",
        email: "",
        password: ""
      });

      setShowForm(false);

      fetchInstructors();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to create instructor"
      );
    }
  };

  return (
    <AdminLayout>
        <div className="min-h-screen bg-slate-950 text-white p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">

            <div>
            <h1 className="text-3xl font-bold">
                Instructors
            </h1>

            <p className="text-slate-400 mt-2">
                Manage instructors in your scheduling system.
            </p>
            </div>

            <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-lg font-semibold transition"
            >
            + Add Instructor
            </button>

        </div>

        {/* Messages */}
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

        {/* Add Instructor Form */}
        {showForm && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">

            <h2 className="text-xl font-semibold mb-6">
                Add New Instructor
            </h2>

            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >

                <div>
                <label className="block text-sm text-slate-400 mb-2">
                    Name
                </label>

                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Instructor name"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
                />
                </div>

                <div>
                <label className="block text-sm text-slate-400 mb-2">
                    Email
                </label>

                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="instructor@example.com"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
                />
                </div>

                <div>
                <label className="block text-sm text-slate-400 mb-2">
                    Password
                </label>

                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
                />
                </div>

                <div className="md:col-span-3 flex justify-end gap-3">

                <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-3 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold"
                >
                    Create Instructor
                </button>

                </div>

            </form>
            </div>
        )}

        {/* Instructor List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">

            <div className="px-6 py-5 border-b border-slate-800">
            <h2 className="font-semibold">
                All Instructors
            </h2>
            </div>

            {loading ? (
            <div className="p-8 text-center text-slate-400">
                Loading instructors...
            </div>
            ) : instructors.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
                No instructors found.
            </div>
            ) : (
            <div className="overflow-x-auto">

                <table className="w-full">

                <thead>
                    <tr className="border-b border-slate-800 text-left text-sm text-slate-400">

                    <th className="px-6 py-4">
                        Instructor
                    </th>

                    <th className="px-6 py-4">
                        Email
                    </th>

                    <th className="px-6 py-4">
                        Role
                    </th>

                    <th className="px-6 py-4">
                        Joined
                    </th>

                    </tr>
                </thead>

                <tbody>

                    {instructors.map((instructor) => (
                    <tr
                        key={instructor._id}
                        className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40"
                    >

                        <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold">
                            {instructor.name.charAt(0)}
                            </div>

                            <span className="font-medium">
                            {instructor.name}
                            </span>

                        </div>

                        </td>

                        <td className="px-6 py-4 text-slate-400">
                        {instructor.email}
                        </td>

                        <td className="px-6 py-4">

                        <span className="px-3 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400">
                            Instructor
                        </span>

                        </td>

                        <td className="px-6 py-4 text-slate-400">
                        {new Date(
                            instructor.createdAt
                        ).toLocaleDateString()}
                        </td>

                    </tr>
                    ))}

                </tbody>

                </table>

            </div>
            )}

        </div>

        </div>
    </AdminLayout>    
  );
};

export default Instructors;