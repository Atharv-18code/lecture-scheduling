import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: "▦"
    },
    {
      name: "Instructors",
      path: "/admin/instructors",
      icon: "👨‍🏫"
    },
    {
      name: "Courses",
      path: "/admin/courses",
      icon: "📚"
    },
    {
      name: "Lectures",
      path: "/admin/lectures",
      icon: "📅"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">

        {/* Logo */}
        <div className="h-20 px-6 flex items-center border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold">
              Lecture Scheduler
            </h1>

            <p className="text-xs text-slate-500 mt-1">
              Admin Panel
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">

          <p className="text-xs uppercase tracking-wider text-slate-500 px-3 mb-3">
            Management
          </p>

          <div className="space-y-2">

            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <span className="text-lg">
                  {item.icon}
                </span>

                <span className="font-medium">
                  {item.name}
                </span>
              </NavLink>
            ))}

          </div>

        </nav>

        {/* Admin Profile */}
        <div className="p-4 border-t border-slate-800">

          <div className="bg-slate-800/60 rounded-lg p-3 mb-3">

            <p className="text-sm font-medium">
              {user?.name}
            </p>

            <p className="text-xs text-slate-400 mt-1 truncate">
              {user?.email}
            </p>

            <span className="inline-block mt-2 text-xs bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded">
              Administrator
            </span>

          </div>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            Logout
          </button>

        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>

    </div>
  );
};

export default AdminLayout;