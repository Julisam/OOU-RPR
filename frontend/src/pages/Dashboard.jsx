import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../api";

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
        const years = (data.years || []).map((year) => String(year));
        setYearOptions(["All Time", ...years]);
        if (!years.includes(activeYear) && activeYear !== "All Time") {
          setActiveYear("All Time");
        }
      } catch (error) {
        console.error("Error loading stats:", error);
        setStatsError("Unable to load dashboard stats.");
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.35)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600/70">
                  Research Productivity
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  Dashboard Overview
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Track your activity across publications, grants, conferences attended, patents, and innovations.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/my-research"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Add New Research
                </Link>
                <Link
                  to="/export-data"
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Export Summary
                </Link>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Selected Year
              </h3>
              <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                {yearOptions.map((year) => (
                  <button
                    key={year}
                    onClick={() => setActiveYear(year)}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
                      activeYear === year
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
            {loadingStats && (
              <p className="text-sm text-slate-500">Loading stats...</p>
            )}
            {statsError && (
              <p className="text-sm text-rose-600">{statsError}</p>
            )}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Total Entries
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.total}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Publications
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.publications}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Conferences Attended
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {stats.conferences_attended}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Category Breakdown
                </h4>
                <span className="text-xs text-slate-500">
                  {activeYear === "All Time" ? "All Time" : `Year ${activeYear}`}
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  { label: "Publications", value: stats.publications },
                  { label: "Conferences Attended", value: stats.conferences_attended },
                  { label: "Grants", value: stats.grants },
                  { label: "Patents", value: stats.patents },
                  { label: "Innovations", value: stats.innovations },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Recent Activity
              </h4>
              <div className="mt-5 space-y-4">
                {recentActivities.length === 0 ? (
                  <p className="text-sm text-slate-500">No recent activity yet.</p>
                ) : (
                  recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {activity.title || "Untitled"}
                      </p>
                      <p className="text-xs text-slate-500">{activity.category}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">{activity.year}</span>
                  </div>
                ))
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default Dashboard;
