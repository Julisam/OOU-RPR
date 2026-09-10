import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";
  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    if (!uid || !token) {
      setError("This password reset link is invalid.");
      setSubmitting(false);
      return;
    }

    if (!formData.new_password || !formData.confirm_password) {
      setError("All password fields are required.");
      setSubmitting(false);
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError("New passwords do not match.");
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
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-12 h-56 w-56 rounded-full bg-blue-200/50 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
      </div>
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
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

          {success ? (
            <div className="mt-7">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <svg
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                Password updated
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-7 w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Go to sign in
              </button>
            </div>
          ) : (
            <>
              <p className="mt-5 text-sm text-slate-500">
                Choose a new password for your account.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label
                    className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400"
                    htmlFor="new_password"
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
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400"
                    htmlFor="confirm_password"
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
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70"
                    placeholder="Re-enter new password"
                  />
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !uid || !token}
                  className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Resetting..." : "Reset Password"}
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
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
