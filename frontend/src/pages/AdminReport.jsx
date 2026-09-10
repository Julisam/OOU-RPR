import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../api";

function AdminReport() {
  const [report, setReport] = useState({
    years: [],
    per_year_publications: {},
    per_year_categories: {},
    per_year_publication_types: {},
    all_time_categories: {},
    all_time_publication_types: {},
    quartile_breakdown: {},
    scope_breakdown: {},
    summary: {},
    faculties: [],
    recent_publications: [],
  });
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("admin-report/");
        setReport(data);
        const sortedYears = (data.years || []).map(Number).sort((a, b) => a - b);
        if (sortedYears.length > 0) {
          setRangeStart(String(sortedYears[0]));
          setRangeEnd(String(sortedYears[sortedYears.length - 1]));
        }
      } catch (err) {
        console.error("Error loading admin report:", err);
        setError(
          err?.response?.data?.detail ||
            "Unable to load admin report. Check your access and try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const yearsAsc = useMemo(
    () => (report.years || []).map(Number).sort((a, b) => a - b),
    [report.years],
  );
  const yearsDesc = useMemo(() => [...yearsAsc].sort((a, b) => b - a), [yearsAsc]);

  const startYearNumber = Number(rangeStart);
  const endYearNumber = Number(rangeEnd);
  const normalizedStart = Number.isFinite(startYearNumber)
    ? Math.min(startYearNumber, endYearNumber || startYearNumber)
    : null;
  const normalizedEnd = Number.isFinite(endYearNumber)
    ? Math.max(endYearNumber, startYearNumber || endYearNumber)
    : null;

  const inRange = (year) => {
    if (!normalizedStart || !normalizedEnd) return false;
    const y = Number(year);
    return y >= normalizedStart && y <= normalizedEnd;
  };

  const lineData = useMemo(
    () =>
      yearsAsc
        .filter((year) => inRange(year))
        .map((year) => ({
          year: String(year),
          count: report.per_year_publications?.[String(year)] || 0,
        })),
    [yearsAsc, report.per_year_publications, normalizedStart, normalizedEnd],
  );

  const periodCategoryStats = useMemo(() => {
    const base = {
      publications: 0,
      conferences_attended: 0,
      grants: 0,
      patents: 0,
      innovations: 0,
      total: 0,
    };
    yearsAsc.filter((year) => inRange(year)).forEach((year) => {
      const row = report.per_year_categories?.[String(year)];
      if (!row) return;
      base.publications += row.publications || 0;
      base.conferences_attended += row.conferences_attended || 0;
      base.grants += row.grants || 0;
      base.patents += row.patents || 0;
      base.innovations += row.innovations || 0;
      base.total += row.total || 0;
    });
    return base;
  }, [yearsAsc, report.per_year_categories, normalizedStart, normalizedEnd]);

  const periodPublicationTypeStats = useMemo(() => {
    const base = { journals: 0, books: 0, conferences: 0 };
    yearsAsc.filter((year) => inRange(year)).forEach((year) => {
      const row = report.per_year_publication_types?.[String(year)];
      if (!row) return;
      base.journals += row.journals || 0;
      base.books += row.books || 0;
      base.conferences += row.conferences || 0;
    });
    return base;
  }, [yearsAsc, report.per_year_publication_types, normalizedStart, normalizedEnd]);

  const facultySummaryForRange = useMemo(() => {
    return (report.faculties || [])
      .map((faculty) => {
        const periodMetrics = {
          publications: 0,
          conferences_attended: 0,
          grants: 0,
          patents: 0,
          innovations: 0,
          total: 0,
        };
        yearsAsc.filter((year) => inRange(year)).forEach((year) => {
          const row = faculty.per_year?.[String(year)];
          if (!row) return;
          periodMetrics.publications += row.publications || 0;
          periodMetrics.conferences_attended += row.conferences_attended || 0;
          periodMetrics.grants += row.grants || 0;
          periodMetrics.patents += row.patents || 0;
          periodMetrics.innovations += row.innovations || 0;
          periodMetrics.total += row.total || 0;
        });
        return { ...faculty, period_metrics: periodMetrics };
      })
      .sort((a, b) => b.period_metrics.total - a.period_metrics.total);
  }, [report.faculties, yearsAsc, normalizedStart, normalizedEnd]);

  const activeFacultiesForRange = facultySummaryForRange.filter(
    (faculty) => (faculty.period_metrics.publications || 0) > 0,
  ).length;

  const bestYear = useMemo(() => {
    const rows = yearsAsc
      .filter((year) => inRange(year))
      .map((year) => ({
        year: String(year),
        count: report.per_year_publications?.[String(year)] || 0,
      }));
    if (rows.length === 0) return null;
    rows.sort((a, b) => b.count - a.count);
    return rows[0];
  }, [yearsAsc, report.per_year_publications, normalizedStart, normalizedEnd]);

  const quartileLabels = {
    Q1: "Q1",
    Q2: "Q2",
    Q3: "Q3",
    Q4: "Q4",
    other: "Others",
  };
  const quartileChartData = Object.entries(quartileLabels).map(([key, label]) => ({
    key,
    name: label,
    count: report.quartile_breakdown?.[key] || 0,
  }));
  const quartileBarColors = {
    Q1: "#2563eb",
    Q2: "#3b82f6",
    Q3: "#60a5fa",
    Q4: "#93c5fd",
    other: "#64748b",
  };
  const scopeLabels = {
    foreign: "Foreign",
    local: "Local",
    other: "Others",
  };
  const scopeChartData = Object.entries(scopeLabels).map(([key, label]) => ({
    key,
    name: label,
    count: report.scope_breakdown?.[key] || 0,
  }));
  const scopeBarColors = {
    foreign: "#0ea5e9",
    local: "#10b981",
    other: "#64748b",
  };

  const rangeLabel =
    normalizedStart && normalizedEnd ? `${normalizedStart} - ${normalizedEnd}` : "—";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.35)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600/70">
                  Institution Overview
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  Admin Report
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Aggregated analytics across all staff and faculties.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    From
                  </label>
                  <select
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70"
                    disabled={loading || yearsDesc.length === 0}
                  >
                    {yearsDesc.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    To
                  </label>
                  <select
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70"
                    disabled={loading || yearsDesc.length === 0}
                  >
                    {yearsDesc.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {loading && <p className="text-sm text-slate-500">Loading Admin report...</p>}
          {error && <p className="text-sm text-rose-600">{error}</p>}

          {!loading && !error && (
            <>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Faculties</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {report.summary?.faculty_count || 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Staff</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {report.summary?.staff_count || 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Total Publications
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {report.summary?.total_publications || 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Active Faculties ({rangeLabel})
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {activeFacultiesForRange}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Range Total ({rangeLabel})
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {periodCategoryStats.total || 0}
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Publications Line Graph
                  </h4>
                  <span className="text-xs text-slate-500">{rangeLabel}</span>
                </div>
                <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  {lineData.length === 0 ? (
                    <p className="text-sm text-slate-500 px-2 py-8">
                      No publication trend data in selected range.
                    </p>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={lineData}
                          margin={{ top: 10, right: 16, left: 0, bottom: 8 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 11 }} />
                          <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                          <Tooltip
                            formatter={(value) => [`${value} publications`, "Count"]}
                            labelFormatter={(label) => `Year ${label}`}
                            contentStyle={{
                              borderRadius: "10px",
                              border: "1px solid #cbd5e1",
                              boxShadow: "0 8px 24px -16px rgba(15,23,42,0.4)",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#2563eb"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#1d4ed8" }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Publication Type Mix
                  </h4>
                  <div className="mt-5 space-y-3">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Publications
                        </p>
                        <p className="text-2xl font-semibold text-slate-900">
                          {periodCategoryStats.publications || 0}
                        </p>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            Journals
                          </p>
                          <p className="mt-1 text-lg font-semibold text-slate-900">
                            {periodPublicationTypeStats.journals || 0}
                          </p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            Books
                          </p>
                          <p className="mt-1 text-lg font-semibold text-slate-900">
                            {periodPublicationTypeStats.books || 0}
                          </p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            Conference Proceedings
                          </p>
                          <p className="mt-1 text-lg font-semibold text-slate-900">
                            {periodPublicationTypeStats.conferences || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Conferences Attended
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                          {periodCategoryStats.conferences_attended || 0}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Grants
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                          {periodCategoryStats.grants || 0}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Patents
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                          {periodCategoryStats.patents || 0}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Innovations
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                          {periodCategoryStats.innovations || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Quartile Distribution
                  </h4>
                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={quartileChartData}
                          margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
                          <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                          <Tooltip
                            formatter={(value) => [`${value} publications`, "Count"]}
                            labelFormatter={(label) => `Quartile ${label}`}
                            contentStyle={{
                              borderRadius: "10px",
                              border: "1px solid #cbd5e1",
                              boxShadow: "0 8px 24px -16px rgba(15,23,42,0.4)",
                            }}
                          />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {quartileChartData.map((entry) => (
                              <Cell
                                key={entry.key}
                                fill={quartileBarColors[entry.key] || "#64748b"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-slate-500">
                    Best publication year in range:{" "}
                    <span className="font-semibold text-slate-700">
                      {bestYear ? `${bestYear.year} (${bestYear.count})` : "—"}
                    </span>
                  </p>

                  <h5 className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Scope Distribution
                  </h5>
                  <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={scopeChartData}
                          margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
                          <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                          <Tooltip
                            formatter={(value) => [`${value} publications`, "Count"]}
                            labelFormatter={(label) => `Scope ${label}`}
                            contentStyle={{
                              borderRadius: "10px",
                              border: "1px solid #cbd5e1",
                              boxShadow: "0 8px 24px -16px rgba(15,23,42,0.4)",
                            }}
                          />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {scopeChartData.map((entry) => (
                              <Cell
                                key={entry.key}
                                fill={scopeBarColors[entry.key] || "#64748b"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Faculty Productivity ({rangeLabel})
                  </h4>
                  <span className="text-xs text-slate-500">
                    Grouped by faculty (missing department grouped as Others)
                  </span>
                </div>
                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">S/N</th>
                        <th className="px-4 py-3 font-medium">Faculty</th>
                        <th className="px-4 py-3 font-medium">Staff</th>
                        <th className="px-4 py-3 font-medium">Total</th>
                        <th className="px-4 py-3 font-medium">Publications</th>
                        <th className="px-4 py-3 font-medium">Conferences</th>
                        <th className="px-4 py-3 font-medium">Grants</th>
                        <th className="px-4 py-3 font-medium">Patents</th>
                        <th className="px-4 py-3 font-medium">Innovations</th>
                        <th className="px-4 py-3 font-medium">Last Pub Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facultySummaryForRange.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="px-4 py-4 text-slate-500">
                            No faculty records found.
                          </td>
                        </tr>
                      ) : (
                        facultySummaryForRange.map((faculty, index) => (
                          <tr key={faculty.code} className="border-t border-slate-200">
                            <td className="px-4 py-3 text-slate-600">{index + 1}</td>
                            <td className="px-4 py-3 text-slate-900">{faculty.name}</td>
                            <td className="px-4 py-3 text-slate-600">
                              {faculty.staff_count || 0}
                            </td>
                            <td className="px-4 py-3 text-slate-900 font-semibold">
                              {faculty.period_metrics.total || 0}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {faculty.period_metrics.publications || 0}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {faculty.period_metrics.conferences_attended || 0}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {faculty.period_metrics.grants || 0}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {faculty.period_metrics.patents || 0}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {faculty.period_metrics.innovations || 0}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {faculty.last_publication_year || "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Recent Publications
                  </h4>
                  <span className="text-xs text-slate-500">Latest 10 entries</span>
                </div>
                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">S/N</th>
                        <th className="px-4 py-3 font-medium">Faculty</th>
                        <th className="px-4 py-3 font-medium">Department</th>
                        <th className="px-4 py-3 font-medium">Author</th>
                        <th className="px-4 py-3 font-medium">Title</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Source</th>
                        <th className="px-4 py-3 font-medium">Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(report.recent_publications || []).length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-4 text-slate-500">
                            No publication records available.
                          </td>
                        </tr>
                      ) : (
                        report.recent_publications.map((item, index) => (
                          <tr key={item.id} className="border-t border-slate-200">
                            <td className="px-4 py-3 text-slate-600">{index + 1}</td>
                            <td className="px-4 py-3 text-slate-900">
                              {item.user__department__faculty__name || "Others"}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {item.user__department__name || "Others"}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {[item.user__sname, item.user__fname].filter(Boolean).join(", ")}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {item.title || "Untitled"}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {item.subcategory || "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {item.subcategory === "books"
                                ? item.book_title || "—"
                                : item.journal_name || "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {item.year || "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AdminReport;
