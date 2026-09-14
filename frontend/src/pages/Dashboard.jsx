import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../api";

/* ─── Stat card ──────────────────────────────────────────────────── */
function StatCard({ label, value, accent = false }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent
          ? "border-blue-100 bg-blue-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className={`mt-3 text-3xl font-bold ${accent ? "text-blue-700" : "text-slate-900"}`}>
        {value}
      </p>
    </div>
  );
}

/* ─── Category row ───────────────────────────────────────────────── */
function CategoryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className="text-sm font-bold tabular-nums text-slate-900">{value}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
function Dashboard() {
  const [yearOptions, setYearOptions] = useState(["All Time"]);
  const [activeYear, setActiveYear] = useState("All Time");
  const [statsData, setStatsData] = useState({ per_year: {}, all_time: {}, recent: [] });
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState("");

  const recentActivities = statsData.recent || [];

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      setStatsError("");
      try {
        const { data } = await api.get("stats/");
        setStatsData(data);
        const years = (data.years || []).map(String);
        setYearOptions(["All Time", ...years]);
        if (!years.includes(activeYear) && activeYear !== "All Time") {
          setActiveYear("All Time");
        }
      } catch (err) {
        console.error("Error loading stats:", err);
        setStatsError("Unable to load dashboard stats.");
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emptyStats = {
    total: 0,
    publications: 0,
    grants: 0,
    patents: 0,
    innovations: 0,
    conferences_attended: 0,
  };

  const stats =
    activeYear === "All Time"
      ? { ...emptyStats, ...statsData.all_time }
      : { ...emptyStats, ...(statsData.per_year?.[activeYear] || {}) };

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <Header />

      <main className="flex-1 w-full">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="flex flex-col gap-6">

            {/* ── Hero banner ──────────────────────────────────────── */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_32px_-16px_rgba(15,23,42,0.15)] sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600/70">
                    Research Productivity
                  </p>
                  <h2 className="mt-1.5 text-xl font-bold text-slate-900 sm:text-2xl">
                    Dashboard Overview
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Track your publications, grants, conferences, patents, and innovations.
                  </p>
                </div>
                {/* CTA buttons — stack on mobile, row on sm+ */}
                <div className="flex flex-col gap-2.5 sm:flex-row sm:shrink-0">
                  <Link
                    to="/my-research"
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
                  >
                    Add Research
                  </Link>
                  <Link
                    to="/export-data"
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-[0.98]"
                  >
                    Export Summary
                  </Link>
                </div>
              </div>
            </section>

            {/* ── Year switcher ─────────────────────────────────────── */}
            <section>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Viewing: {activeYear}
                </h3>
              </div>

              {/* Horizontally scrollable pill strip — critical for many years on mobile */}
              <div className="mt-3 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
                  {yearOptions.map((year) => (
                    <button
                      key={year}
                      onClick={() => setActiveYear(year)}
                      className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        activeYear === year
                          ? "bg-slate-900 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loading / error states */}
              {loadingStats && (
                <p className="mt-3 text-sm text-slate-500">Loading stats…</p>
              )}
              {statsError && (
                <p className="mt-3 text-sm text-rose-600">{statsError}</p>
              )}

              {/* Stat cards — 1 col → 2 col (sm) → 3 col (md) */}
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                <StatCard label="Total Entries" value={stats.total} accent />
                <StatCard label="Publications" value={stats.publications} />
                <StatCard label="Conferences Attended" value={stats.conferences_attended} />
              </div>
            </section>

            {/* ── Category breakdown + Recent activity ─────────────── */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Category breakdown */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Category Breakdown
                  </h4>
                  <span className="text-xs text-slate-400">
                    {activeYear === "All Time" ? "All Time" : `Year ${activeYear}`}
                  </span>
                </div>
                <div className="mt-4 space-y-2.5">
                  <CategoryRow label="Publications" value={stats.publications} />
                  <CategoryRow label="Conferences Attended" value={stats.conferences_attended} />
                  <CategoryRow label="Grants" value={stats.grants} />
                  <CategoryRow label="Patents" value={stats.patents} />
                  <CategoryRow label="Innovations" value={stats.innovations} />
                </div>
              </div>

              {/* Recent activity */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Recent Activity
                </h4>
                <div className="mt-4 space-y-3.5">
                  {recentActivities.length === 0 ? (
                    <p className="text-sm text-slate-500">No recent activity yet.</p>
                  ) : (
                    recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {activity.title || "Untitled"}
                          </p>
                          <p className="mt-0.5 text-xs capitalize text-slate-500">
                            {activity.category}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-slate-400">
                          {activity.year}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;
