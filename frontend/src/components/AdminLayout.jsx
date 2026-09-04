import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarDays,
  Bell,
  LogOut,
  GraduationCap
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
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
      icon: LayoutDashboard
    },
    {
      name: "Instructors",
      path: "/admin/instructors",
      icon: Users
    },
    {
      name: "Courses",
      path: "/admin/courses",
      icon: BookOpen
    },
    {
      name: "Lectures",
      path: "/admin/lectures",
      icon: CalendarDays
    },
    {
      name: "Notifications",
      path: "/admin/notifications",
      icon: Bell
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <GraduationCap size={22} />
          </div>

          <div>
            <h1 className="font-bold text-lg">
              LectureHub
            </h1>
            <p className="text-xs text-slate-400">
              Admin Panel
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-semibold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.name}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;