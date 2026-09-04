import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Instructors from "./pages/admin/Instructors";
import Courses from "./pages/admin/Courses";
import Lectures from "./pages/admin/Lectures";
import Notifications from "./pages/admin/Notifications";
import ExtraLectureRequests from "./pages/admin/ExtraLectureRequests";

import InstructorDashboard from "./pages/instructor/InstructorDashboard";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<AdminDashboard />}
        />

        <Route
          path="instructors"
          element={<Instructors />}
        />

        <Route
          path="courses"
          element={<Courses />}
        />

        <Route
          path="lectures"
          element={<Lectures />}
        />

        <Route
          path="notifications"
          element={<Notifications />}
        />

        <Route
          path="extra-lectures"
          element={<ExtraLectureRequests />}
        />
      </Route>

      <Route
        path="/instructor"
        element={
          <ProtectedRoute role="instructor">
            <InstructorDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;