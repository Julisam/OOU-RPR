import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_50px_-40px_rgba(15,23,42,0.35)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600/70">
          Error 404
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Page Not Found
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
