
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Home from "./Home";
import Login from "./Login";
import Dashboard from "./Dashboard";
import { isLoggedIn } from "./api";

function RequireAuth({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const navigate = useNavigate();

  // Fired by api.js whenever a request comes back 401 with a token
  // attached — meaning the token expired or was invalidated server-side.
  // Without this, a protected page would sit there showing stale data and
  // broken error messages instead of sending the user back to log in.
  useEffect(() => {
    function handleAuthError() {
      navigate("/login");
    }
    window.addEventListener("continuum:auth-error", handleAuthError);
    return () => window.removeEventListener("continuum:auth-error", handleAuthError);
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AppRoutes />
    </BrowserRouter>
  );
}