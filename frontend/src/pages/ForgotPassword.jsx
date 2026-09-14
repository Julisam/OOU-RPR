import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const OFFICIAL_EMAIL_DOMAIN = "@oouagoiwoye.edu.ng";

/* Shared auth-card wrapper used by Login, ForgotPassword, ResetPassword */
function AuthCard({ children }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-slate-50">
      {/* Decorative blobs */}
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

function ForgotPassword() {
  const [officialemail, setOfficialemail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const normalizedEmail = officialemail.trim().toLowerCase();
    if (!normalizedEmail.endsWith(OFFICIAL_EMAIL_DOMAIN)) {
      setError(`Enter your official email ending in ${OFFICIAL_EMAIL_DOMAIN}`);
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
    <AuthCard>
      {success ? (
        <div className="mt-7">
          {/* Success icon */}
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600" aria-hidden="true">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Check your inbox</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            If an active account is registered to{" "}
            <span className="font-medium text-slate-700">
              {officialemail.trim().toLowerCase()}
            </span>
            , we have sent a password reset link. The link expires once used.
          </p>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-7 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <>
          <p className="mt-5 text-sm leading-relaxed text-slate-500">
            Enter your official university email and we will send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label
                htmlFor="officialemail"
                className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
              >
                Official Email
              </label>
              <input
                id="officialemail"
                name="officialemail"
                type="email"
                required
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                value={officialemail}
                onChange={(e) => setOfficialemail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70 sm:text-sm"
                placeholder="staff@oouagoiwoye.edu.ng"
              />
              <p className="mt-1.5 text-xs text-slate-400">
                Must end in {OFFICIAL_EMAIL_DOMAIN}
              </p>
            </div>

            {error && (
              <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending link…" : "Send Reset Link"}
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
    </AuthCard>
  );
}

export default ForgotPassword;
