
import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn, clearToken } from "./api";

export default function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  return (
    <div className="flex items-center justify-between px-6 lg:px-10 py-4 bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-lg font-bold text-teal-700 tracking-wide">
          CONTINUUM
        </Link>

        <div className="hidden sm:flex items-center gap-6">
          {loggedIn ? (
            <>
              <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition">
                Dashboard
              </Link>
              <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition">
                Upload a report
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 transition">
                Home
              </Link>
              <a href="/#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition">
                How it works
              </a>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {loggedIn ? (
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg border border-gray-200 transition"
          >
            Log out
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 transition"
            >
              Log in
            </Link>
            <Link
              to="/login?mode=signup"
              className="text-sm font-medium text-white px-4 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-700 hover:opacity-90 transition"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}