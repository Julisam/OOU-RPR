import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_8px_32px_-16px_rgba(15,23,42,0.15)]">
        {/* 404 badge */}
        <span className="inline-block rounded-xl bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
          Error 404
        </span>

        <h1 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Page Not Found
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/dashboard"
            className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] sm:w-auto"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/login"
            className="w-full rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-[0.98] sm:w-auto"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
