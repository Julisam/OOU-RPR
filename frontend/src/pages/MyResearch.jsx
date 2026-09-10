import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../api";

function MyResearch() {
  const [activeTab, setActiveTab] = useState("publications");
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(activeTab);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const labelClass =
    "block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2";
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70";
  const publicationScopeOptions = [
    { value: "foreign", label: "Foreign" },
    { value: "local", label: "Local" },
  ];
  const journalQuartileOptions = [
    { value: "Q1", label: "Quartile 1" },
    { value: "Q2", label: "Quartile 2" },
    { value: "Q3", label: "Quartile 3" },
    { value: "Q4", label: "Quartile 4" },
    { value: "other", label: "Others" },
  ];
  const publicationScopeLabels = publicationScopeOptions.reduce(
    (acc, option) => ({ ...acc, [option.value]: option.label }),
    {},
  );
  const journalQuartileLabels = journalQuartileOptions.reduce(
    (acc, option) => ({ ...acc, [option.value]: option.label }),
    {},
  );

  const inferPublicationScope = (work) => {
    const location = String(work?.["publisher-location"] || "").toLowerCase();
    if (!location) return "";
    if (location.includes("nigeria")) return "local";
    return "foreign";
  };

  const fetchDOIDetails = async (doi) => {
    if (!doi) return;

    setLoading(true);
    try {
      const response = await fetch(`https://api.crossref.org/works/${doi}`);
      const data = await response.json();
      const work = data.message;

      // Determine publication type from work type
      let publicationType = "";
      if (work.type === "journal-article") {
        publicationType = "journal";
      } else if (
        work.type === "book" ||
        work.type === "monograph" ||
        work.type === "book-chapter"
      ) {
        publicationType = "book";
      } else if (work.type === "proceedings-article") {
        publicationType = "conference";
      }

      const inferredScope = inferPublicationScope(work);
      setFormData((prev) => ({
        ...prev,
        title: work.title?.[0] || "",
        bookTitle:
          publicationType === "book"
            ? work["container-title"]?.[0] || prev.bookTitle || ""
            : prev.bookTitle || "",
        authors:
          work.author
            ?.map((a) => `${a.given || ""} ${a.family || ""}`)
            .join(", ") || "",
        journal:
          publicationType === "book"
            ? work.publisher || work["container-title"]?.[0] || ""
            : work["container-title"]?.[0] || "",
        volume: work.volume || "",
        issue: work.issue || "",
        publicationYear: String(
          work.published?.["date-parts"]?.[0]?.[0] ||
            work.issued?.["date-parts"]?.[0]?.[0] ||
            "",
        ),
        publicationType: publicationType,
        publicationScope: prev.publicationScope || inferredScope,
        doi: work.DOI || doi,
      }));
    } catch (error) {
      console.error("Error fetching DOI details:", error);
    }
    setLoading(false);
  };

  const handleDOIBlur = (e) => {
    const doi = e.target.value
      .replace("https://doi.org/", "")
      .replace("http://dx.doi.org/", "");
    if (doi) {
      fetchDOIDetails(doi);
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const refreshActivities = async () => {
    setLoadingActivities(true);
    try {
      const { data } = await api.get("research-activities/");
      setActivities(data);
    } catch (error) {
      console.error("Error loading research activities:", error);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    refreshActivities();
  }, []);

  const tabs = [
    { id: "publications", label: "Publications" },
    { id: "conferences_attended", label: "Conferences Attended" },
    { id: "grants", label: "Grants" },
    { id: "innovations", label: "Innovations" },
    { id: "patents", label: "Patents" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "publications": {
        const publications = activities.filter(
          (item) => item.category === "publications",
        );
        const publicationGroups = [
          { id: "journals", label: "Journal Articles" },
          { id: "books", label: "Books" },
          { id: "conferences", label: "Conference Publications" },
        ];

        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Publications
              </h3>
              <p className="text-slate-500">
                Manage your research publications here.
              </p>
            </div>

            {loadingActivities ? (
              <div className="text-sm text-slate-500">
                Loading publications...
              </div>
            ) : (
              publicationGroups.map((group) => {
                const items = publications.filter(
                  (item) => item.subcategory === group.id,
                );
                return (
                  <div key={group.id} className="space-y-3">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {group.label}
                    </h4>
                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="px-4 py-3 font-medium">S/N</th>
                            <th className="px-4 py-3 font-medium">Title</th>
                            <th className="px-4 py-3 font-medium">Authors</th>
                            <th className="px-4 py-3 font-medium">Source</th>
                            <th className="px-4 py-3 font-medium">Editors</th>
                            <th className="px-4 py-3 font-medium">Year</th>
                            <th className="px-4 py-3 font-medium">Scope</th>
                            <th className="px-4 py-3 font-medium">Quartile</th>
                            <th className="px-4 py-3 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.length === 0 ? (
                            <tr>
                              <td
                                colSpan={9}
                                className="px-4 py-4 text-slate-500"
                              >
                                No entries yet.
                              </td>
                            </tr>
                          ) : (
                            items.map((item, index) => (
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
                                  {item.subcategory === "books"
                                    ? item.book_title || "—"
                                    : item.journal_name || "—"}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {item.editors || "—"}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {item.year || "—"}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {publicationScopeLabels[
                                    item.publication_scope
                                  ] || "—"}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {journalQuartileLabels[
                                    item.journal_quartile
                                  ] || "—"}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleEditPublication(item)
                                      }
                                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteActivity(item.id)
                                      }
                                      className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );
      }
      case "conferences_attended": {
        const conferences = activities.filter(
          (item) => item.category === "conferences_attended",
        );
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Conferences Attended
              </h3>
              <p className="text-slate-500">
                Track your conference attendance.
              </p>
            </div>

            {loadingActivities ? (
              <div className="text-sm text-slate-500">
                Loading conferences...
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">S/N</th>
                      <th className="px-4 py-3 font-medium">Conference</th>
                      <th className="px-4 py-3 font-medium">Title</th>
                      <th className="px-4 py-3 font-medium">Location</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conferences.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-4 text-slate-500">
                          No entries yet.
                        </td>
                      </tr>
                    ) : (
                      conferences.map((item, index) => (
                        <tr key={item.id} className="border-t border-slate-200">
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
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditConference(item)}
                                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteActivity(item.id)}
                                className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      }
      case "grants": {
        const grants = activities.filter((item) => item.category === "grants");
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Grants
              </h3>
              <p className="text-slate-500">
                Monitor your research grants here.
              </p>
            </div>

            {loadingActivities ? (
              <div className="text-sm text-slate-500">Loading grants...</div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">S/N</th>
                      <th className="px-4 py-3 font-medium">Title</th>
                      <th className="px-4 py-3 font-medium">Grant No.</th>
                      <th className="px-4 py-3 font-medium">Agency</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Start</th>
                      <th className="px-4 py-3 font-medium">End</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grants.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-4 text-slate-500">
                          No entries yet.
                        </td>
                      </tr>
                    ) : (
                      grants.map((item, index) => {
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
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditGrant(item)}
                                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteActivity(item.id)}
                                  className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      }
      case "innovations": {
        const innovations = activities.filter(
          (item) => item.category === "innovations",
        );
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Innovations
              </h3>
              <p className="text-slate-500">
                Track your innovations and technology transfer here.
              </p>
            </div>

            {loadingActivities ? (
              <div className="text-sm text-slate-500">
                Loading innovations...
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">S/N</th>
                      <th className="px-4 py-3 font-medium">Title</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Partner</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {innovations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 text-slate-500">
                          No entries yet.
                        </td>
                      </tr>
                    ) : (
                      innovations.map((item, index) => (
                        <tr key={item.id} className="border-t border-slate-200">
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
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditInnovation(item)}
                                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteActivity(item.id)}
                                className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      }
      case "patents": {
        const patents = activities.filter(
          (item) => item.category === "patents",
        );
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Patents
              </h3>
              <p className="text-slate-500">Track your patents here.</p>
            </div>

            {loadingActivities ? (
              <div className="text-sm text-slate-500">Loading patents...</div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">S/N</th>
                      <th className="px-4 py-3 font-medium">Title</th>
                      <th className="px-4 py-3 font-medium">Patent No.</th>
                      <th className="px-4 py-3 font-medium">Agency</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Filing Date</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-4 text-slate-500">
                          No entries yet.
                        </td>
                      </tr>
                    ) : (
                      patents.map((item, index) => (
                        <tr key={item.id} className="border-t border-slate-200">
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
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditPatent(item)}
                                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteActivity(item.id)}
                                className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  };

  const renderFormFields = () => {
    switch (selectedCategory) {
      case "publications":
        return (
          <>
            <div className="mb-4">
              <label className={labelClass}>DOI/URL</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  className={`${inputClass} flex-1`}
                  placeholder="Enter DOI to auto-fill details"
                  onBlur={handleDOIBlur}
                  name="doi"
                  value={formData.doi || ""}
                  onChange={handleFieldChange}
                />
                {loading && (
                  <span className="text-xs text-blue-600 self-center">
                    Loading...
                  </span>
                )}
              </div>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Publication Type *</label>
              <select
                className={inputClass}
                name="publicationType"
                value={formData.publicationType || ""}
                onChange={handleFieldChange}
                required
              >
                <option value="">Select Publication Type</option>
                <option value="journal">Journal Article</option>
                <option value="book">Book</option>
                <option value="conference">Conference Publication</option>
              </select>
            </div>
            <div className="mb-4">
              <label className={labelClass}>
                {formData.publicationType === "book"
                  ? "Title of Paper/Chapter *"
                  : "Title *"}
              </label>
              <input
                type="text"
                className={inputClass}
                name="title"
                value={formData.title || ""}
                onChange={handleFieldChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Authors *</label>
              <input
                type="text"
                className={inputClass}
                name="authors"
                value={formData.authors || ""}
                onChange={handleFieldChange}
                required
              />
            </div>
            {formData.publicationType === "book" ? (
              <>
                <div className="mb-4">
                  <label className={labelClass}>Title of Book *</label>
                  <input
                    type="text"
                    className={inputClass}
                    name="bookTitle"
                    value={formData.bookTitle || ""}
                    onChange={handleFieldChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className={labelClass}>Publisher *</label>
                  <input
                    type="text"
                    className={inputClass}
                    name="journal"
                    value={formData.journal || ""}
                    onChange={handleFieldChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className={labelClass}>Editors</label>
                  <input
                    type="text"
                    className={inputClass}
                    name="editors"
                    value={formData.editors || ""}
                    onChange={handleFieldChange}
                    placeholder="Optional"
                  />
                </div>
              </>
            ) : (
              <div className="mb-4">
                <label className={labelClass}>Journal/Publisher *</label>
                <input
                  type="text"
                  className={inputClass}
                  name="journal"
                  value={formData.journal || ""}
                  onChange={handleFieldChange}
                  required
                />
              </div>
            )}

            <div className="mb-4">
              <label className={labelClass}>Publication Year *</label>
              <input
                type="number"
                min="1980"
                max={new Date().getFullYear() + 1}
                className={inputClass}
                name="publicationYear"
                value={formData.publicationYear || ""}
                onChange={handleFieldChange}
                required
              />
            </div>
            {formData.publicationType !== "book" && (
              <>
                <div className="mb-4">
                  <label className={labelClass}>Volume</label>
                  <input
                    type="text"
                    className={inputClass}
                    name="volume"
                    value={formData.volume || ""}
                    onChange={handleFieldChange}
                  />
                </div>
                <div className="mb-4">
                  <label className={labelClass}>Issue</label>
                  <input
                    type="text"
                    className={inputClass}
                    name="issue"
                    value={formData.issue || ""}
                    onChange={handleFieldChange}
                  />
                </div>
              </>
            )}
            <div className="mb-4">
              <label className={labelClass}>Scope (Foreign/Local) *</label>
              <select
                className={inputClass}
                name="publicationScope"
                value={formData.publicationScope || ""}
                onChange={handleFieldChange}
                required
              >
                <option value="">Select Scope</option>
                {publicationScopeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Publication Quartile *</label>
              <select
                className={inputClass}
                name="journalQuartile"
                value={formData.journalQuartile || ""}
                onChange={handleFieldChange}
                required
              >
                <option value="">Select Quartile</option>
                {journalQuartileOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        );
      case "conferences_attended":
        return (
          <>
            <div className="mb-4">
              <label className={labelClass}>Conference Name</label>
              <input
                type="text"
                name="conferenceName"
                value={formData.conferenceName || ""}
                onChange={handleFieldChange}
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Presentation Title</label>
              <input
                type="text"
                name="presentationTitle"
                value={formData.presentationTitle || ""}
                onChange={handleFieldChange}
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Location</label>
              <input
                type="text"
                name="conferenceLocation"
                value={formData.conferenceLocation || ""}
                onChange={handleFieldChange}
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Date</label>
              <input
                type="date"
                name="conferenceDate"
                value={formData.conferenceDate || ""}
                onChange={handleFieldChange}
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Type</label>
              <select
                name="conferenceType"
                value={formData.conferenceType || ""}
                onChange={handleFieldChange}
                className={inputClass}
              >
                <option value="oral">Oral Presentation</option>
                <option value="poster">Poster</option>
                <option value="keynote">Keynote</option>
              </select>
            </div>
          </>
        );
      case "grants":
        return (
          <>
            <div className="mb-4">
              <label className={labelClass}>Grant Title</label>
              <input
                type="text"
                name="grantTitle"
                value={formData.grantTitle || ""}
                onChange={handleFieldChange}
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Grant Number</label>
              <input
                type="text"
                name="grantNumber"
                value={formData.grantNumber || ""}
                onChange={handleFieldChange}
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Funding Agency</label>
              <input
                type="text"
                name="fundingAgency"
                value={formData.fundingAgency || ""}
                onChange={handleFieldChange}
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Amount</label>
              <input
                type="number"
                name="grantAmount"
                value={formData.grantAmount || ""}
                onChange={handleFieldChange}
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Currency</label>
              <input
                type="text"
                name="grantCurrency"
                value={formData.grantCurrency || ""}
                onChange={handleFieldChange}
                className={inputClass}
                placeholder="NGN, USD, EUR, etc."
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Start Date</label>
              <input
                type="date"
                name="grantStartDate"
                value={formData.grantStartDate || ""}
                onChange={handleFieldChange}
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>End Date</label>
              <input
                type="date"
                name="grantEndDate"
                value={formData.grantEndDate || ""}
                onChange={handleFieldChange}
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Status</label>
              <select
                name="grantStatus"
                value={formData.grantStatus || ""}
                onChange={handleFieldChange}
                className={inputClass}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Description</label>
              <textarea
                name="grantDescription"
                value={formData.grantDescription || ""}
                onChange={handleFieldChange}
                className={`${inputClass} h-24 resize-none`}
                placeholder="Optional details about this grant"
              />
            </div>
          </>
        );
      case "innovations":
        return (
          <>
            <div className="mb-4">
              <label className={labelClass}>Innovation Title</label>
              <input
                type="text"
                name="innovationTitle"
                value={formData.innovationTitle || ""}
                onChange={handleFieldChange}
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Type</label>
              <select
                name="innovationType"
                value={formData.innovationType || ""}
                onChange={handleFieldChange}
                className={inputClass}
              >
                <option value="prototype">Prototype</option>
                <option value="software">Software/Tool</option>
                <option value="technology_transfer">Technology Transfer</option>
              </select>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Development Date</label>
              <input
                type="date"
                name="innovationDate"
                value={formData.innovationDate || ""}
                onChange={handleFieldChange}
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Industry Partner</label>
              <input
                type="text"
                name="industryPartner"
                value={formData.industryPartner || ""}
                onChange={handleFieldChange}
                className={inputClass}
                placeholder="If applicable"
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Description</label>
              <textarea
                name="innovationDescription"
                value={formData.innovationDescription || ""}
                onChange={handleFieldChange}
                className={`${inputClass} h-24 resize-none`}
              />
            </div>
          </>
        );
      case "patents":
        return (
          <>
            <div className="mb-4">
              <label className={labelClass}>Patent Title</label>
              <input
                type="text"
                name="patentTitle"
                value={formData.patentTitle || ""}
                onChange={handleFieldChange}
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Inventors</label>
              <input
                type="text"
                name="patentInventors"
                value={formData.patentInventors || ""}
                onChange={handleFieldChange}
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Patent Number</label>
              <input
                type="text"
                name="patentNumber"
                value={formData.patentNumber || ""}
                onChange={handleFieldChange}
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>
                Patent Registration Body/Agency
              </label>
              <input
                type="text"
                name="patentAgency"
                value={formData.patentAgency || ""}
                onChange={handleFieldChange}
                className={inputClass}
                placeholder="e.g., USPTO, EPO, NOTAP"
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Filing Date</label>
              <input
                type="date"
                name="patentFilingDate"
                value={formData.patentFilingDate || ""}
                onChange={handleFieldChange}
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Status</label>
              <select
                name="patentStatus"
                value={formData.patentStatus || ""}
                onChange={handleFieldChange}
                className={inputClass}
              >
                <option value="filed">Filed</option>
                <option value="granted">Granted</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Abstract</label>
              <textarea
                name="patentAbstract"
                value={formData.patentAbstract || ""}
                onChange={handleFieldChange}
                className={`${inputClass} h-24 resize-none`}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const handleModalOpen = () => {
    setSelectedCategory(activeTab);
    setFormData({});
    setSubmitError("");
    setEditingId(null);
    setShowModal(true);
  };

  const buildPayload = () => {
    const basePayload = {
      category: selectedCategory,
    };

    if (selectedCategory === "publications") {
      const subcategoryMap = {
        journal: "journals",
        book: "books",
        conference: "conferences",
      };

      return {
        ...basePayload,
        subcategory: subcategoryMap[formData.publicationType] || null,
        title: formData.title || "",
        book_title: formData.bookTitle || "",
        editors: formData.editors || "",
        authors: formData.authors || "",
        journal_name: formData.journal || "",
        volume:
          formData.publicationType === "book" ? "" : formData.volume || "",
        issue: formData.publicationType === "book" ? "" : formData.issue || "",
        publication_scope: formData.publicationScope || "",
        journal_quartile: formData.journalQuartile || "",
        doi: formData.doi || "",
        year: formData.publicationYear || "",
      };
    }

    if (selectedCategory === "conferences_attended") {
      const conferenceYear = formData.conferenceDate
        ? Number(formData.conferenceDate.split("-")[0])
        : null;
      return {
        ...basePayload,
        title: formData.presentationTitle || "",
        conference_name: formData.conferenceName || "",
        location: formData.conferenceLocation || "",
        date: formData.conferenceDate || "",
        year: conferenceYear,
        description: formData.conferenceType
          ? `Type: ${formData.conferenceType}`
          : "",
      };
    }

    if (selectedCategory === "grants") {
      const grantYear = formData.grantStartDate
        ? Number(formData.grantStartDate.split("-")[0])
        : null;

      return {
        ...basePayload,
        title: formData.grantTitle || "",
        grant_number: formData.grantNumber || "",
        funding_agency: formData.fundingAgency || "",
        amount: formData.grantAmount ? Number(formData.grantAmount) : null,
        currency: formData.grantCurrency || "",
        start_date: formData.grantStartDate || null,
        end_date: formData.grantEndDate || null,
        status: formData.grantStatus || "",
        date: formData.grantStartDate || "",
        year: grantYear,
        description: formData.grantDescription || "",
      };
    }

    if (selectedCategory === "innovations") {
      const innovationYear = formData.innovationDate
        ? Number(formData.innovationDate.split("-")[0])
        : null;
      return {
        ...basePayload,
        title: formData.innovationTitle || "",
        subcategory: formData.innovationType || null,
        collaborators: formData.industryPartner || "",
        date: formData.innovationDate || "",
        year: innovationYear,
        description: formData.innovationDescription || "",
      };
    }

    if (selectedCategory === "patents") {
      const descriptionParts = [];
      if (formData.patentInventors) {
        descriptionParts.push(`Inventors: ${formData.patentInventors}`);
      }
      if (formData.patentAbstract) {
        descriptionParts.push(formData.patentAbstract);
      }
      const patentYear = formData.patentFilingDate
        ? Number(formData.patentFilingDate.split("-")[0])
        : null;

      return {
        ...basePayload,
        title: formData.patentTitle || "",
        patent_number: formData.patentNumber || "",
        patent_status: formData.patentStatus || "",
        patent_agency: formData.patentAgency || "",
        date: formData.patentFilingDate || "",
        year: patentYear,
        description: descriptionParts.join("\n\n"),
      };
    }

    return basePayload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      const isBlank = (value) => String(value || "").trim().length === 0;
      if (selectedCategory === "publications") {
        const requiredFields = [
          formData.publicationType,
          formData.title,
          formData.authors,
          formData.journal,
          formData.publicationYear,
          formData.publicationScope,
          formData.journalQuartile,
        ];
        if (formData.publicationType === "book") {
          requiredFields.push(formData.bookTitle);
        }
        if (requiredFields.some(isBlank)) {
          setSubmitError("Please complete all required fields.");
          setSubmitting(false);
          return;
        }
      }

      const payload = buildPayload();
      if (editingId) {
        await api.put(`research-activities/${editingId}/`, payload);
      } else {
        await api.post("research-activities/", payload);
      }
      await refreshActivities();
      setShowModal(false);
      setFormData({});
    } catch (error) {
      console.error("Error saving research activity:", error);
      setSubmitError("Unable to save. Please review the form and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPublication = (activity) => {
    const publicationTypeMap = {
      journals: "journal",
      books: "book",
      conferences: "conference",
    };
    setSelectedCategory("publications");
    setEditingId(activity.id);
    setFormData({
      doi: activity.doi || "",
      publicationType: publicationTypeMap[activity.subcategory] || "",
      title: activity.title || "",
      bookTitle: activity.book_title || "",
      editors: activity.editors || "",
      authors: activity.authors || "",
      journal: activity.journal_name || "",
      publicationYear: activity.year ? String(activity.year) : "",
      volume: activity.volume || "",
      issue: activity.issue || "",
      publicationScope: activity.publication_scope || "",
      journalQuartile: activity.journal_quartile || "",
    });
    setSubmitError("");
    setShowModal(true);
  };

  const handleEditGrant = (activity) => {
    setSelectedCategory("grants");
    setEditingId(activity.id);
    setFormData({
      grantTitle: activity.title || "",
      grantNumber: activity.grant_number || "",
      fundingAgency: activity.funding_agency || "",
      grantAmount:
        activity.amount != null && activity.amount !== ""
          ? String(activity.amount)
          : "",
      grantCurrency: activity.currency || "",
      grantStartDate: activity.start_date || activity.date || "",
      grantEndDate: activity.end_date || "",
      grantStatus: activity.status || "",
      grantDescription: activity.description || "",
    });
    setSubmitError("");
    setShowModal(true);
  };

  const handleEditConference = (activity) => {
    const conferenceType = activity.description?.startsWith("Type: ")
      ? activity.description.replace("Type: ", "")
      : "";
    setSelectedCategory("conferences_attended");
    setEditingId(activity.id);
    setFormData({
      conferenceName: activity.conference_name || "",
      presentationTitle: activity.title || "",
      conferenceLocation: activity.location || "",
      conferenceDate: activity.date || "",
      conferenceType,
    });
    setSubmitError("");
    setShowModal(true);
  };

  const handleEditInnovation = (activity) => {
    setSelectedCategory("innovations");
    setEditingId(activity.id);
    setFormData({
      innovationTitle: activity.title || "",
      innovationType: activity.subcategory || "",
      industryPartner: activity.collaborators || "",
      innovationDate: activity.date || "",
      innovationDescription: activity.description || "",
    });
    setSubmitError("");
    setShowModal(true);
  };

  const handleEditPatent = (activity) => {
    let patentInventors = "";
    let patentAbstract = "";
    if (activity.description) {
      const parts = activity.description.split("\n\n");
      const firstPart = parts[0] || "";
      if (firstPart.startsWith("Inventors: ")) {
        patentInventors = firstPart.replace("Inventors: ", "");
        patentAbstract = parts.slice(1).join("\n\n");
      } else {
        patentAbstract = activity.description;
      }
    }
    setSelectedCategory("patents");
    setEditingId(activity.id);
    setFormData({
      patentTitle: activity.title || "",
      patentNumber: activity.patent_number || "",
      patentAgency: activity.patent_agency || "",
      patentStatus: activity.patent_status || "",
      patentFilingDate: activity.date || "",
      patentInventors,
      patentAbstract,
    });
    setSubmitError("");
    setShowModal(true);
  };

  const handleDeleteActivity = async (activityId) => {
    const confirmed = window.confirm(
      "Delete this publication? This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      await api.delete(`research-activities/${activityId}/`);
      setActivities((prev) => prev.filter((item) => item.id !== activityId));
    } catch (error) {
      console.error("Error deleting research activity:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                My Research
              </h2>
              <p className="text-sm text-slate-500">
                Track publications, conferences, grants, patents, and
                innovations.
              </p>
            </div>
            <button
              onClick={handleModalOpen}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Add New Research
            </button>
          </div>

          <div className="flex gap-6">
            <aside className="w-64 shrink-0 self-start rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-36px_rgba(15,23,42,0.3)] sticky top-24">
              <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 mb-4">
                Categories
              </h3>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </aside>

            <section className="flex-1 rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_16px_40px_-36px_rgba(15,23,42,0.3)]">
              {renderContent()}
            </section>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_28px_70px_-45px_rgba(15,23,42,0.55)]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Add New Research
                </h3>
                <p className="text-sm text-slate-500">
                  Select a category and complete the required fields.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <form
              className="mt-6 max-h-[65vh] overflow-y-auto pr-2"
              onSubmit={handleSubmit}
            >
              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2">
                  Category
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="publications">Publications</option>
                  <option value="conferences_attended">
                    Conferences Attended
                  </option>
                  <option value="grants">Grants</option>
                  <option value="innovations">Innovations</option>
                  <option value="patents">Patents</option>
                </select>
              </div>
              {renderFormFields()}
              {submitError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                  {submitError}
                </div>
              )}
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default MyResearch;
