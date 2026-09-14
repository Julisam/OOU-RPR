import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/token/", formData);
      localStorage.setItem(ACCESS_TOKEN, data.access);
      localStorage.setItem(REFRESH_TOKEN, data.refresh);

      const payload = JSON.parse(atob(data.access.split(".")[1]));
      localStorage.setItem("username", payload.username);
      localStorage.setItem("role", payload.role);

      navigate("/dashboard");
    } catch {
      setError("Invalid credentials. Please check your Staff ID and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* min-h-dvh handles mobile browser chrome (address bar) better than min-h-screen */
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-slate-50">
      {/* Decorative blobs — pointer-events-none so they never block taps */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-20 -top-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -bottom-10 -right-16 h-64 w-64 rounded-full bg-emerald-200/35 blur-3xl sm:h-80 sm:w-80" />
      </div>

      {/* Centred card */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.3)] backdrop-blur sm:p-8">

          {/* Branding */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 shadow-sm">
              <img src="/oou.png" alt="OOU Logo" className="h-7 w-7 object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                Olabisi Onabanjo University
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-600/80">
                Research Productivity Portal
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-slate-500">
            Sign in to manage your research productivity records.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {/* Staff ID */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
              >
                Staff ID
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                value={formData.username}
                onChange={handleChange}
                /* text-base prevents iOS from zooming in on focus */
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70 sm:text-sm"
                placeholder="OOU/ACA/P.123"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Footer links */}
          <p className="mt-5 text-center text-xs text-slate-400">
            Need access? Contact the ICT.{" "}
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="ml-0.5 font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Forgot password?
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
