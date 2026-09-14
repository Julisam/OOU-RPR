import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

/* ─── Icon helpers ─────────────────────────────────────────────────── */
function HamburgerIcon({ open }) {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" />
      )}
    </svg>
  );
}

function ChevronDown({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/* ─── Shared style helpers ─────────────────────────────────────────── */
const navBtnBase =
  "inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";
const navBtnActive =
  "border-blue-600 bg-blue-600 text-white shadow-[0_8px_20px_-10px_rgba(37,99,235,0.7)]";
const navBtnInactive =
  "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700";

const dropdownItemBase =
  "block w-full rounded-lg px-4 py-2.5 text-left text-sm font-semibold transition-colors";
const dropdownItemActive = "bg-blue-600 text-white";
const dropdownItemInactive = "text-slate-700 hover:bg-slate-100 hover:text-blue-700";

/* ─── Mobile nav link ──────────────────────────────────────────────── */
function MobileNavLink({ to, active, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
        active ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100 hover:text-blue-700"
      }`}
    >
      {children}
    </Link>
  );
}

/* ─── Mobile section header ────────────────────────────────────────── */
function MobileSectionLabel({ children }) {
  return (
    <p className="mt-4 mb-1 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
      {children}
    </p>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const currentPath = location.pathname;

  // Mobile drawer open/close
  const [menuOpen, setMenuOpen] = useState(false);
  // Desktop: which dropdown is open ("reports" | "account" | null)
  const [openDropdown, setOpenDropdown] = useState(null);

  const reportsDropdownRef = useRef(null);
  const accountDropdownRef = useRef(null);

  const isActive = (path) => currentPath.startsWith(path);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Close mobile menu & desktop dropdowns on route change
  useEffect(() => {
    setMenuOpen(false);
    setOpenDropdown(null);
  }, [currentPath]);

  // Close desktop dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        reportsDropdownRef.current?.contains(e.target) ||
        accountDropdownRef.current?.contains(e.target)
      ) {
        return;
      }
      setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleDropdown = (name) =>
    setOpenDropdown((prev) => (prev === name ? null : name));

  const reportsActive =
    isActive("/annual-report") ||
    isActive("/productivity-metrics") ||
    isActive("/export-data");

  const accountActive =
    isActive("/profile") ||
    isActive("/my-account") ||
    isActive("/change-password");

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-[0_4px_24px_-8px_rgba(15,23,42,0.12)]">
      {/* ── Top bar ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 sm:h-20">

          {/* Logo + branding */}
          <Link to="/dashboard" className="flex shrink-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-xl">
            <img
              alt="OOU Logo"
              className="h-10 w-10 rounded-xl border border-slate-200 bg-white p-1 shadow-sm sm:h-12 sm:w-12"
              src="/oou.png"
            />
            <div className="leading-tight">
              <p className="text-base font-extrabold text-slate-900 sm:text-lg">
                OOU Research Portal
              </p>
              <p className="hidden text-xs font-medium text-slate-400 sm:block">
                Research Productivity Management
              </p>
            </div>
          </Link>

          {/* Desktop nav (md+) */}
          <nav className="hidden items-center gap-1.5 md:flex" aria-label="Main navigation">
            {role === "hod" && (
              <Link to="/hod-report" className={`${navBtnBase} ${isActive("/hod-report") ? navBtnActive : navBtnInactive}`}>
                HOD Report
              </Link>
            )}
            {role === "dean" && (
              <Link to="/dean-report" className={`${navBtnBase} ${isActive("/dean-report") ? navBtnActive : navBtnInactive}`}>
                Dean Report
              </Link>
            )}
            {(role === "dvc" || role === "admin") && (
              <Link to="/admin-report" className={`${navBtnBase} ${isActive("/admin-report") ? navBtnActive : navBtnInactive}`}>
                Admin Report
              </Link>
            )}

            <Link to="/dashboard" className={`${navBtnBase} ${isActive("/dashboard") ? navBtnActive : navBtnInactive}`}>
              Dashboard
            </Link>

            <Link to="/my-research" className={`${navBtnBase} ${isActive("/my-research") ? navBtnActive : navBtnInactive}`}>
              My Research
            </Link>

            {/* Reports dropdown */}
            <div className="relative" ref={reportsDropdownRef}>
              <button
                type="button"
                onClick={() => toggleDropdown("reports")}
                aria-expanded={openDropdown === "reports"}
                aria-haspopup="true"
                className={`${navBtnBase} ${reportsActive ? navBtnActive : navBtnInactive}`}
              >
                Reports
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${openDropdown === "reports" ? "rotate-180" : ""}`} />
              </button>
              {openDropdown === "reports" && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <Link to="/annual-report" className={`${dropdownItemBase} ${isActive("/annual-report") ? dropdownItemActive : dropdownItemInactive}`}>
                    Annual Report
                  </Link>
                  <Link to="/productivity-metrics" className={`${dropdownItemBase} ${isActive("/productivity-metrics") ? dropdownItemActive : dropdownItemInactive}`}>
                    Productivity Metrics
                  </Link>
                  <Link to="/export-data" className={`${dropdownItemBase} ${isActive("/export-data") ? dropdownItemActive : dropdownItemInactive}`}>
                    Export Data
                  </Link>
                </div>
              )}
            </div>

            {/* Account dropdown */}
            <div className="relative" ref={accountDropdownRef}>
              <button
                type="button"
                onClick={() => toggleDropdown("account")}
                aria-expanded={openDropdown === "account"}
                aria-haspopup="true"
                className={`${navBtnBase} ${accountActive ? navBtnActive : navBtnInactive}`}
              >
                {username || "Account"}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${openDropdown === "account" ? "rotate-180" : ""}`} />
              </button>
              {openDropdown === "account" && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <Link to="/profile" className={`${dropdownItemBase} ${isActive("/profile") ? dropdownItemActive : dropdownItemInactive}`}>
                    Profile
                  </Link>
                  <Link to="/my-account" className={`${dropdownItemBase} ${isActive("/my-account") ? dropdownItemActive : dropdownItemInactive}`}>
                    Fellowships &amp; Research Profile
                  </Link>
                  <Link to="/change-password" className={`${dropdownItemBase} ${isActive("/change-password") ? dropdownItemActive : dropdownItemInactive}`}>
                    Change Password
                  </Link>
                  <hr className="my-1.5 border-slate-100" />
                  <button
                    onClick={handleLogout}
                    className={`${dropdownItemBase} ${dropdownItemInactive} text-rose-600 hover:bg-rose-50 hover:text-rose-700`}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ──────────────────────────────────────────── */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-6 pt-3 md:hidden" role="navigation" aria-label="Mobile navigation">
          {/* Greeting */}
          <p className="mb-3 px-4 text-xs font-semibold text-slate-500">
            Hello, <span className="text-slate-800">{username || "User"}</span>
          </p>

          {/* Primary links */}
          <MobileSectionLabel>Navigation</MobileSectionLabel>
          <MobileNavLink to="/dashboard" active={isActive("/dashboard")} onClick={() => setMenuOpen(false)}>
            Dashboard
          </MobileNavLink>
          <MobileNavLink to="/my-research" active={isActive("/my-research")} onClick={() => setMenuOpen(false)}>
            My Research
          </MobileNavLink>

          {/* Role-specific */}
          {role === "hod" && (
            <MobileNavLink to="/hod-report" active={isActive("/hod-report")} onClick={() => setMenuOpen(false)}>
              HOD Report
            </MobileNavLink>
          )}
          {role === "dean" && (
            <MobileNavLink to="/dean-report" active={isActive("/dean-report")} onClick={() => setMenuOpen(false)}>
              Dean Report
            </MobileNavLink>
          )}
          {(role === "dvc" || role === "admin") && (
            <MobileNavLink to="/admin-report" active={isActive("/admin-report")} onClick={() => setMenuOpen(false)}>
              Admin Report
            </MobileNavLink>
          )}

          {/* Reports */}
          <MobileSectionLabel>Reports</MobileSectionLabel>
          <MobileNavLink to="/annual-report" active={isActive("/annual-report")} onClick={() => setMenuOpen(false)}>
            Annual Report
          </MobileNavLink>
          <MobileNavLink to="/productivity-metrics" active={isActive("/productivity-metrics")} onClick={() => setMenuOpen(false)}>
            Productivity Metrics
          </MobileNavLink>
          <MobileNavLink to="/export-data" active={isActive("/export-data")} onClick={() => setMenuOpen(false)}>
            Export Data
          </MobileNavLink>

          {/* Account */}
          <MobileSectionLabel>Account</MobileSectionLabel>
          <MobileNavLink to="/profile" active={isActive("/profile")} onClick={() => setMenuOpen(false)}>
            Profile
          </MobileNavLink>
          <MobileNavLink to="/my-account" active={isActive("/my-account")} onClick={() => setMenuOpen(false)}>
            Fellowships &amp; Research Profile
          </MobileNavLink>
          <MobileNavLink to="/change-password" active={isActive("/change-password")} onClick={() => setMenuOpen(false)}>
            Change Password
          </MobileNavLink>

          {/* Logout */}
          <div className="mt-4 border-t border-slate-100 pt-4">
            <button
              onClick={handleLogout}
              className="block w-full rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
            >
              Log out
            </button>
          </div>

          {/* Footer link */}
          <a
            href="https://oouagoiwoye.edu.ng"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block px-4 text-xs font-medium text-blue-600 hover:underline"
          >
            Visit official site ↗
          </a>
        </div>
      )}

      {/* ── Desktop sub-bar (greeting + external link) ─────────────── */}
      <div className="hidden border-t border-slate-100 bg-slate-50/70 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5 lg:px-8">
          <span className="text-xs font-semibold text-slate-500">
            Hello, <span className="text-slate-700">{username || "User"}</span>
          </span>
          <a
            href="https://oouagoiwoye.edu.ng"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Visit official site ↗
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;
