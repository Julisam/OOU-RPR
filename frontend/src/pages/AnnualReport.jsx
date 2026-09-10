import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../api";

function AnnualReport() {
  const [statsData, setStatsData] = useState({
    years: [],
    per_year: {},
    activities: [],
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeYear, setActiveYear] = useState("");

  useEffect(() => {
    const fetchAnnualReportData = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("annual-report/");
        setStatsData(data);
        setActivities(data.activities || []);

        const availableYears = (data.years || [])
          .map((year) => String(year))
          .sort((a, b) => Number(b) - Number(a));
        setActiveYear(availableYears[0] || String(new Date().getFullYear()));
      } catch (err) {
        console.error("Error loading annual report data:", err);
        setError("Unable to load annual report data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnualReportData();
  }, []);

  const yearOptions = useMemo(() => {
    const years = (statsData.years || [])
      .map((year) => String(year))
      .sort((a, b) => Number(b) - Number(a));
    return years;
  }, [statsData.years]);

  const emptyStats = {
    total: 0,
    publications: 0,
    grants: 0,
    patents: 0,
    innovations: 0,
    conferences_attended: 0,
  };

  const statsForYear = activeYear
    ? { ...emptyStats, ...(statsData.per_year?.[activeYear] || {}) }
    : emptyStats;

  const activitiesForYear = useMemo(() => {
    if (!activeYear) return [];
    return activities.filter((item) => String(item.year) === activeYear);
  }, [activities, activeYear]);

  const byCategory = useMemo(() => {
    const groups = {
      publications: [],
      conferences_attended: [],
      grants: [],
      patents: [],
      innovations: [],
    };

    activitiesForYear.forEach((item) => {
      if (groups[item.category]) {
        groups[item.category].push(item);
      }
    });

    return groups;
  }, [activitiesForYear]);

  const publicationGroups = useMemo(() => {
    const groups = {
      journals: [],
      books: [],
      conferences: [],
    };

    byCategory.publications.forEach((item) => {
      if (item.subcategory && groups[item.subcategory]) {
        groups[item.subcategory].push(item);
      }
    });

    return groups;
  }, [byCategory.publications]);

  const renderTableShell = (columns, rows) => (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );

  const renderEmptyRow = (colSpan) => (
    <tr>
      <td colSpan={colSpan} className="px-4 py-4 text-slate-500">
        No entries for {activeYear}.
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.35)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600/70">
                  Academic Reporting
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                  Annual Report
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Review your research output and activity summaries by year.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Reporting Year
                </label>
                <select
                  value={activeYear}
                  onChange={(e) => setActiveYear(e.target.value)}
                  className="min-w-45 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70"
                  disabled={loading || yearOptions.length === 0}
                >
                  {yearOptions.length === 0 ? (
                    <option value="">No years</option>
                  ) : (
                    yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
            {loading && (
              <p className="mt-4 text-sm text-slate-500">
                Loading annual report...
              </p>
            )}
            {error && (
              <p className="mt-4 text-sm font-medium text-rose-600">{error}</p>
            )}
          </section>

          {!loading && !error && (
            <>
              <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
                {[
                  { label: "Total Entries", value: statsForYear.total },
                  { label: "Publications", value: statsForYear.publications },
                  {
                    label: "Conferences",
                    value: statsForYear.conferences_attended,
                  },
                  { label: "Grants", value: statsForYear.grants },
                  { label: "Patents", value: statsForYear.patents },
                  { label: "Innovations", value: statsForYear.innovations },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {card.label}
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">
                      {card.value}
                    </p>
                  </div>
                ))}
              </section>

              <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Category Breakdown
                    </h2>
                    <span className="text-xs text-slate-500">
                      Year {activeYear}
                    </span>
                  </div>
                  <div className="mt-5 space-y-3">
                    {[
                      {
                        label: "Publications",
                        value: statsForYear.publications,
                      },
                      {
                        label: "Conferences Attended",
                        value: statsForYear.conferences_attended,
                      },
                      { label: "Grants", value: statsForYear.grants },
                      { label: "Patents", value: statsForYear.patents },
                      { label: "Innovations", value: statsForYear.innovations },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                      >
                        <span className="text-sm font-medium text-slate-700">
                          {item.label}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Snapshot
                  </h2>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      Entries captured:{" "}
                      <span className="font-semibold text-slate-900">
                        {activitiesForYear.length}
                      </span>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      Most active category:{" "}
                      <span className="font-semibold text-slate-900">
                        {[
                          {
                            key: "publications",
                            label: "Publications",
                            value: statsForYear.publications,
                          },
                          {
                            key: "conferences_attended",
                            label: "Conferences",
                            value: statsForYear.conferences_attended,
                          },
                          {
                            key: "grants",
                            label: "Grants",
                            value: statsForYear.grants,
                          },
                          {
                            key: "patents",
                            label: "Patents",
                            value: statsForYear.patents,
                          },
                          {
                            key: "innovations",
                            label: "Innovations",
                            value: statsForYear.innovations,
                          },
                        ]
                          .sort((a, b) => b.value - a.value)[0]
                          ?.label || "—"}
                      </span>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Publications By Type
                      </p>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {[
                          {
                            label: "Journals",
                            value: publicationGroups.journals.length,
                          },
                          {
                            label: "Books",
                            value: publicationGroups.books.length,
                          },
                          {
                            label: "Conference Pubs",
                            value: publicationGroups.conferences.length,
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2"
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                              {item.label}
                            </p>
                            <p className="mt-1 text-xl font-semibold text-slate-900">
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Publications
                  </h2>
                  <p className="text-sm text-slate-500">
                    Publications recorded for {activeYear}.
                  </p>
                </div>

                {[
                  { key: "journals", label: "Journal Articles" },
                  { key: "books", label: "Books" },
                  { key: "conferences", label: "Conference Publications" },
                ].map((group) => {
                  const items = publicationGroups[group.key];
                  return (
                    <div key={group.key} className="space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        {group.label}
                      </h3>
                      {renderTableShell(
                        [
                          "S/N",
                          "Title",
                          "Authors",
                          "Journal/Publisher",
                          "Year",
                          "Scope",
                          "Quartile",
                        ],
                        items.length === 0
                          ? renderEmptyRow(7)
                          : items.map((item, index) => (
                              <tr
                                key={item.id}
                                className="border-t border-slate-200"
                              >
                                <td className="px-4 py-3 text-slate-600">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-3 text-slate-900">
                                  {item.title || "Untitled"}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {item.authors || "—"}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {item.journal_name || "—"}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {item.year || "—"}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {item.publication_scope || "—"}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {item.journal_quartile || "—"}
                                </td>
                              </tr>
                            )),
                      )}
                    </div>
                  );
                })}
              </section>

              <section className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Conferences Attended
                  </h2>
                  <p className="text-sm text-slate-500">
                    Conferences recorded for {activeYear}.
                  </p>
                </div>
                {renderTableShell(
                  [
                    "S/N",
                    "Conference",
                    "Title",
                    "Location",
                    "Date",
                    "Type",
                  ],
                  byCategory.conferences_attended.length === 0
                    ? renderEmptyRow(6)
                    : byCategory.conferences_attended.map((item, index) => (
                        <tr
                          key={item.id}
                          className="border-t border-slate-200"
                        >
                          <td className="px-4 py-3 text-slate-600">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-slate-900">
                            {item.conference_name || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {item.title || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {item.location || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {item.date || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {item.description?.replace("Type: ", "") || "—"}
                          </td>
                        </tr>
                      )),
                )}
              </section>

              <section className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Grants
                  </h2>
                  <p className="text-sm text-slate-500">
                    Grants recorded for {activeYear}.
                  </p>
                </div>
                {renderTableShell(
                  [
                    "S/N",
                    "Title",
                    "Grant No.",
                    "Agency",
                    "Amount",
                    "Start",
                    "End",
                    "Status",
                  ],
                  byCategory.grants.length === 0
                    ? renderEmptyRow(8)
                    : byCategory.grants.map((item, index) => {
                        const startDate = item.start_date || item.date || "—";
                        const endDate = item.end_date || "—";
                        const amountDisplay =
                          item.amount != null && item.amount !== ""
                            ? `${item.currency || ""} ${item.amount}`.trim()
                            : "—";
                        return (
                          <tr
                            key={item.id}
                            className="border-t border-slate-200"
                          >
                            <td className="px-4 py-3 text-slate-600">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3 text-slate-900">
                              {item.title || "Untitled"}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {item.grant_number || "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {item.funding_agency || "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {amountDisplay}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {startDate}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {endDate}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {item.status || "—"}
                            </td>
                          </tr>
                        );
                      }),
                )}
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Patents
                    </h2>
                    <p className="text-sm text-slate-500">
                      Patents recorded for {activeYear}.
                    </p>
                  </div>
                  {renderTableShell(
                    [
                      "S/N",
                      "Title",
                      "Patent No.",
                      "Agency",
                      "Status",
                      "Filing Date",
                    ],
                    byCategory.patents.length === 0
                      ? renderEmptyRow(6)
                      : byCategory.patents.map((item, index) => (
                          <tr
                            key={item.id}
                            className="border-t border-slate-200"
                          >
                            <td className="px-4 py-3 text-slate-600">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3 text-slate-900">
                              {item.title || "Untitled"}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {item.patent_number || "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {item.patent_agency || "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {item.patent_status || "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {item.date || "—"}
                            </td>
                          </tr>
                        )),
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Innovations
                    </h2>
                    <p className="text-sm text-slate-500">
                      Innovations recorded for {activeYear}.
                    </p>
                  </div>
                  {renderTableShell(
                    ["S/N", "Title", "Type", "Partner", "Date"],
                    byCategory.innovations.length === 0
                      ? renderEmptyRow(5)
                      : byCategory.innovations.map((item, index) => (
                          <tr
                            key={item.id}
                            className="border-t border-slate-200"
                          >
                            <td className="px-4 py-3 text-slate-600">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3 text-slate-900">
                              {item.title || "Untitled"}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {item.subcategory || "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {item.collaborators || "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {item.date || "—"}
                            </td>
                          </tr>
                        )),
                  )}
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

export default AnnualReport;
