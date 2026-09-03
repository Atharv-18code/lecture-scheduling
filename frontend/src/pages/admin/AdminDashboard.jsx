import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 min-h-screen">

        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-white">
              LectureHub
            </h1>

            <p className="text-xs text-slate-500">
              Admin Panel
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white">
            <span>📊</span>
            Dashboard
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition">
            <span>👨‍🏫</span>
            Instructors
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition">
            <span>📚</span>
            Courses
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition">
            <span>📅</span>
            Lectures
          </button>

        </nav>

        {/* Logout */}
        <div className="absolute bottom-6 left-0 w-64 px-4">

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition"
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1">

        {/* Header */}
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8">

          <div>
            <h2 className="text-xl font-semibold">
              Dashboard
            </h2>

            <p className="text-sm text-slate-500">
              Manage your lecture scheduling system
            </p>
          </div>

          <div className="flex items-center gap-3">

            <div className="text-right">
              <p className="text-sm font-medium">
                {user?.name}
              </p>

              <p className="text-xs text-slate-500">
                Administrator
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold">
              {user?.name?.charAt(0)}
            </div>

          </div>

        </header>

        {/* Dashboard Content */}
        <div className="p-8">

          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.name?.split(" ")[0]} 👋
            </h1>

            <p className="text-slate-400 mt-2">
              Here's what's happening with your scheduling system.
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <p className="text-sm text-slate-400">
                Total Instructors
              </p>

              <h3 className="text-3xl font-bold mt-3">
                3
              </h3>

              <p className="text-xs text-slate-500 mt-2">
                Active instructors
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <p className="text-sm text-slate-400">
                Total Courses
              </p>

              <h3 className="text-3xl font-bold mt-3">
                0
              </h3>

              <p className="text-xs text-slate-500 mt-2">
                Available courses
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <p className="text-sm text-slate-400">
                Scheduled Lectures
              </p>

              <h3 className="text-3xl font-bold mt-3">
                0
              </h3>

              <p className="text-xs text-slate-500 mt-2">
                Total scheduled
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <p className="text-sm text-slate-400">
                Upcoming
              </p>

              <h3 className="text-3xl font-bold mt-3">
                0
              </h3>

              <p className="text-xs text-slate-500 mt-2">
                Upcoming lectures
              </p>
            </div>

          </div>

          {/* Quick Actions */}
          <div className="mt-8">

            <h2 className="text-xl font-semibold mb-4">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <button className="text-left bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-xl p-6 transition">

                <div className="text-2xl mb-4">
                  👨‍🏫
                </div>

                <h3 className="font-semibold">
                  Manage Instructors
                </h3>

                <p className="text-sm text-slate-500 mt-2">
                  Add and manage instructors.
                </p>

              </button>

              <button className="text-left bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-xl p-6 transition">

                <div className="text-2xl mb-4">
                  📚
                </div>

                <h3 className="font-semibold">
                  Add Course
                </h3>

                <p className="text-sm text-slate-500 mt-2">
                  Create a new course.
                </p>

              </button>

              <button className="text-left bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-xl p-6 transition">

                <div className="text-2xl mb-4">
                  📅
                </div>

                <h3 className="font-semibold">
                  Schedule Lecture
                </h3>

                <p className="text-sm text-slate-500 mt-2">
                  Assign a lecture to an instructor.
                </p>

              </button>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default AdminDashboard;