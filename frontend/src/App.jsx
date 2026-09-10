import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import MyResearch from "./pages/MyResearch";
import MyAccount from "./pages/MyAccount";
import HODReport from "./pages/HODReport";
import DeanReport from "./pages/DeanReport";
import AdminReport from "./pages/AdminReport";
import AnnualReport from "./pages/AnnualReport";
import ProductivityMetrics from "./pages/ProductivityMetrics";
import ExportData from "./pages/ExportData";
import ChangePassword from "./pages/ChangePassword";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-research"
          element={
            <ProtectedRoute>
              <MyResearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-account"
          element={
            <ProtectedRoute>
              <MyAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hod-report"
          element={
            <ProtectedRoute>
              <HODReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dean-report"
          element={
            <ProtectedRoute>
              <DeanReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-report"
          element={
            <ProtectedRoute>
              <AdminReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/annual-report"
          element={
            <ProtectedRoute>
              <AnnualReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/productivity-metrics"
          element={
            <ProtectedRoute>
              <ProductivityMetrics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/export-data"
          element={
            <ProtectedRoute>
              <ExportData />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
