import { useEffect } from "react";
import VoiceAssistant from './components/VoiceAssistant';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import PublicLayout from "./PublicLayout";
import AppLayout from "./AppLayout";
import Home from "./Home";
import Login from "./Login";
import DashboardOverview from "./DashBoardOverview";
import LabReports from "./LabReports";
import AIInsights from "./AIInsights";
import HealthTrends from "./HealthTrends";
import { isLoggedIn } from "./api";
import './App.css';

function RequireAuth({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const navigate = useNavigate();

  // Fired by api.js whenever a request comes back 401 with a token
  // attached — meaning the token expired or was invalidated server-side.
  useEffect(() => {
    function handleAuthError() {
      navigate("/login");
    }
    window.addEventListener("continuum:auth-error", handleAuthError);
    return () => window.removeEventListener("continuum:auth-error", handleAuthError);
  }, [navigate]);

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Route>

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardOverview />} />
        <Route path="/lab-reports" element={<LabReports />} />
        <Route path="/insights" element={<AIInsights />} />
        <Route path="/trends" element={<HealthTrends />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}