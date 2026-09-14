import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";

/* Shared auth-card wrapper — mirrors Login / ForgotPassword */
function AuthCard({ children }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-20 -top-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -bottom-10 -right-16 h-64 w-64 rounded-full bg-emerald-200/35 blur-3xl sm:h-80 sm:w-80" />
      </div>
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
          {children}
        </div>
      </div>
    </div>
  );
}

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  const [formData, setFormData] = useState({ new_password: "", confirm_password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    if (!uid || !token) {
      setError("This password reset link is invalid or has expired.");
      setSubmitting(false);
      return;
    }

    if (!formData.new_password || !formData.confirm_password) {
      setError("All password fields are required.");
      setSubmitting(false);
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError("Passwords do not match.");
      setSubmitting(false);
      return;
    }

    try {
      await api.post("reset-password/", {
        uid,
        token,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });
      setSuccess(true);
    } catch (requestError) {
      const responseErrors = requestError.response?.data;
      const fieldError =
        responseErrors?.confirm_password?.[0] ||
        responseErrors?.new_password?.[0];
      setError(
        fieldError ||
          responseErrors?.detail ||
          "Unable to reset your password. Please request a new link."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard>
      {success ? (
        <div className="mt-7">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600" aria-hidden="true">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Password updated</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Your password has been reset. You can now sign in with your new password.
          </p>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-7 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
          >
            Go to sign in
          </button>
        </div>
      ) : (
        <>
          {/* Invalid link warning */}
          {(!uid || !token) && (
            <div role="alert" className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              This reset link is invalid or has expired. Please{" "}
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="font-semibold underline"
              >
                request a new one
              </button>
              .
            </div>
          )}

          <p className="mt-5 text-sm leading-relaxed text-slate-500">
            Choose a new password for your account.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label
                htmlFor="new_password"
                className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
              >
                New Password
              </label>
              <input
                id="new_password"
                name="new_password"
                type="password"
                required
                autoComplete="new-password"
                value={formData.new_password}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70 sm:text-sm"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label
                htmlFor="confirm_password"
                className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
              >
                Confirm Password
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                autoComplete="new-password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70 sm:text-sm"
                placeholder="Re-enter new password"
              />
            </div>

            {error && (
              <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !uid || !token}
              className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Resetting…" : "Reset Password"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-400">
            Back to{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              sign in
            </button>
          </p>
        </>
      )}
    </AuthCard>
  );
}

export default ResetPassword;
