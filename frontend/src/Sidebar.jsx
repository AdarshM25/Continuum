import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, Sparkles, TrendingUp, LogOut } from "lucide-react";
import { getProfile, clearToken } from "./api";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/lab-reports", label: "Lab Reports", icon: FileText },
  { to: "/insights", label: "AI Insights", icon: Sparkles },
  { to: "/trends", label: "Health Trends", icon: TrendingUp },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => {}); // non-critical — sidebar still works without a name
  }, []);

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  const initials = profile?.name
    ? profile.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-gray-100">
        <span className="text-lg font-bold text-teal-700 tracking-wide">CONTINUUM</span>
      </div>

      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-800 truncate">
            {profile?.name || "Loading…"}
          </div>
          <div className="text-xs text-gray-400 truncate">{profile?.email || ""}</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive ? "bg-teal-50 text-teal-700" : "text-gray-600 hover:bg-gray-50"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          <LogOut size={17} />
          Log out
        </button>
      </div>
    </aside>
  );
}