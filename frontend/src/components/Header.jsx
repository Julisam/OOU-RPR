import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem("username");
  const currentPath = location.pathname;
  const role = localStorage.getItem("role");
  const [openMenu, setOpenMenu] = useState(null);
  const reportsRef = useRef(null);
  const accountRef = useRef(null);

  const isActive = (path) => currentPath.startsWith(path);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setOpenMenu(null), 0);
    return () => window.clearTimeout(timer);
  }, [currentPath]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        reportsRef.current?.contains(event.target) ||
        accountRef.current?.contains(event.target)
      ) {
        return;
      }
      setOpenMenu(null);
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  const navBaseClass =
    "inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold transition";
  const navActiveClass =
    "border-blue-600 bg-blue-600 text-white shadow-[0_12px_24px_-18px_rgba(37,99,235,0.8)]";
  const navInactiveClass =
    "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700";
  const navClass = (active) =>
    `${navBaseClass} ${active ? navActiveClass : navInactiveClass}`;

  const menuItemClass = (active) =>
    `block rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
      active
        ? "bg-blue-600 text-white"
        : "text-slate-700 hover:bg-slate-100 hover:text-blue-700"
    }`;

  return (
    <header className="border-b border-slate-200 bg-white shadow-[0_18px_45px_-40px_rgba(15,23,42,0.45)]">
      <div className="max-w-7xl mx-auto px-8 py-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <img
              alt="OOU Logo"
              className="h-14 w-14 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm"
              src="/oou.png"
            />
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">
                OOU Research Portal
              </h1>
              <p className="text-sm font-medium text-slate-500">
                Research Productivity Management System
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2">
            {role==="hod" && (
              <Link to="/hod-report" className={navClass(isActive("/hod-report"))}>
                HOD Report
              </Link>
            )}
            {role==="dean" && (
              <Link to="/dean-report" className={navClass(isActive("/dean-report"))}>
                Dean Report
              </Link>
            )}
            {role==="dvc" && (
              <Link to="/admin-report" className={navClass(isActive("/admin-report"))}>
                Admin Report
              </Link>
            )}
            <Link to="/dashboard" className={navClass(isActive("/dashboard"))}>
              Dashboard
            </Link>
            <Link to="/my-research" className={navClass(isActive("/my-research"))}>
              My Research
            </Link>

            <div className="relative group" ref={reportsRef}>
              <button
                type="button"
                className={navClass(
                  isActive("/annual-report") ||
                    isActive("/productivity-metrics") ||
                    isActive("/export-data"),
                )}
                onClick={() =>
                  setOpenMenu((prev) => (prev === "reports" ? null : "reports"))
                }
              >
                Reports
                <span className="ml-2 text-[11px] opacity-70">▾</span>
              </button>
              <div
                className={`absolute top-full left-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl transition-all duration-150 z-20 ${
                  openMenu === "reports"
                    ? "opacity-100 visible"
                    : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                }`}
              >
                <Link to="/annual-report" className={menuItemClass(isActive("/annual-report"))}>
                  Annual Report
                </Link>
                <Link
                  to="/productivity-metrics"
                  className={menuItemClass(isActive("/productivity-metrics"))}
                >
                  Productivity Metrics
                </Link>
                <Link to="/export-data" className={menuItemClass(isActive("/export-data"))}>
                  Export Data
                </Link>
              </div>
            </div>

            <div className="relative group" ref={accountRef}>
              <button
                type="button"
                className={navClass(
                  isActive("/profile") ||
                    isActive("/my-account") ||
                    isActive("/change-password"),
                )}
                onClick={() =>
                  setOpenMenu((prev) => (prev === "account" ? null : "account"))
                }
              >
                My Account
                <span className="ml-2 text-[11px] opacity-70">▾</span>
              </button>
              <div
                className={`absolute top-full left-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl transition-all duration-150 z-20 ${
                  openMenu === "account"
                    ? "opacity-100 visible"
                    : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                }`}
              >
                <Link to="/profile" className={menuItemClass(isActive("/profile"))}>
                  Profile
                </Link>
                <Link
                  to="/my-account"
                  className={menuItemClass(isActive("/my-account"))}
                >
                  Fellowships &amp; Research Profile
                </Link>
                <Link
                  to="/change-password"
                  className={menuItemClass(isActive("/change-password"))}
                >
                  Change Password
                </Link>
                <button onClick={handleLogout} className={menuItemClass(false)}>
                  Logout
                </button>
              </div>
            </div>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-3 mt-1 border-t border-slate-200 text-sm text-slate-600 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-semibold text-slate-700">Hello {username || "User"}</div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://oouagoiwoye.edu.ng"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Visit official site
          </a>
          <span className="text-slate-300">|</span>
          <button onClick={handleLogout} className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
