import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const OFFICIAL_EMAIL_DOMAIN = "@oouagoiwoye.edu.ng";

function ForgotPassword() {
  const [officialemail, setOfficialemail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const normalizedEmail = officialemail.trim().toLowerCase();
    if (!normalizedEmail.endsWith(OFFICIAL_EMAIL_DOMAIN)) {
      setError(`Enter an official email ending in ${OFFICIAL_EMAIL_DOMAIN}`);
      setLoading(false);
      return;
    }

    try {
      await api.post("forgot-password/", { officialemail: normalizedEmail });
      setSuccess(true);
    } catch (requestError) {
      const responseErrors = requestError.response?.data;
      const fieldError = responseErrors?.officialemail?.[0];
      setError(
        fieldError ||
          responseErrors?.detail ||
          "Unable to send a reset link. Please try again."
      );
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
                Check your inbox
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                If an active account is registered to{" "}
                <span className="font-medium text-slate-700">
                  {officialemail.trim().toLowerCase()}
                </span>
                , we have sent a password reset link. The link will expire after it is used.
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-7 w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <p className="mt-5 text-sm text-slate-500">
                Enter your official university email and we will send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label
                    className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400"
                    htmlFor="officialemail"
                  >
                    Official Email
                  </label>
                  <input
                    id="officialemail"
                    name="officialemail"
                    type="email"
                    required
                    autoComplete="email"
                    value={officialemail}
                    onChange={(event) => setOfficialemail(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70"
                    placeholder={`staff@oouagoiwoye.edu.ng`}
                  />
                  <p className="text-xs text-slate-400">
                    Use the email ending in {OFFICIAL_EMAIL_DOMAIN}
                  </p>
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
                  {loading ? "Sending link..." : "Send Reset Link"}
                </button>
              </form>

              <p className="mt-5 text-center text-xs text-slate-400">
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
