import { Link } from "react-router-dom";

function UnderDevelopment({ title, subtitle }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-10 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
          <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-blue-100 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-emerald-100 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
              Under Development
            </span>
            <h1 className="mt-6 text-3xl font-semibold text-slate-900">
              {title}
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              {subtitle || "This section is being crafted. Please check back soon."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Back to Dashboard
              </Link>
              <Link
                to="/my-research"
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Go to My Research
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UnderDevelopment;
