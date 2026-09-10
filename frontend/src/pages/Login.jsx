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

      // Decode JWT and store user info
      const payload = JSON.parse(atob(data.access.split(".")[1]));
      localStorage.setItem("username", payload.username);
      localStorage.setItem("role", payload.role);

      navigate("/dashboard");
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-12 h-56 w-56 rounded-full bg-blue-200/50 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
      </div>
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
              <img
                src="/oou.png"
                alt="OOU"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                Olabisi Onabanjo University
              </h1>
              <p className="text-xs uppercase tracking-[0.25em] text-blue-600/80">
                Research Productivity Portal
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Sign in to manage your research productivity records.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label
                className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400"
                htmlFor="username"
              >
                Staff ID
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70"
                placeholder="OOU/ACA/P.123"
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-400">
            Need access? Contact the ICT.{" "}
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="ml-1 font-semibold text-blue-600 hover:text-blue-700 hover:underline"
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
