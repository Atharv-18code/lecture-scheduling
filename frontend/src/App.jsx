import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Instructors from "./pages/admin/Instructors";
import Courses from "./pages/admin/Courses";
import Lectures from "./pages/admin/Lectures";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";


function App() {
  return (
    <Routes>

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor"
        element={
          <ProtectedRoute role="instructor">
            <InstructorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      <Route
        path="/admin/instructors"
        element={
          <ProtectedRoute role="admin">
            <Instructors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute role="admin">
            <Courses />
          </ProtectedRoute>
  }
      />
      <Route
        path="/admin/lectures"
        element={
          <ProtectedRoute role="admin">
            <Lectures />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/lectures"
        element={
          <ProtectedRoute role="admin">
            <Lectures />
          </ProtectedRoute>
        }
       />

    </Routes>
      
  );
}

export default App;