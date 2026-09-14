import { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../api";

/* ─── Shared class constants ─────────────────────────────────────── */
const labelClass =
  "block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2";
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 " +
  "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70 sm:text-sm";

/* ─── Option lists ───────────────────────────────────────────────── */
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
const publicationScopeLabels = Object.fromEntries(publicationScopeOptions.map((o) => [o.value, o.label]));
const journalQuartileLabels = Object.fromEntries(journalQuartileOptions.map((o) => [o.value, o.label]));

const JOURNAL_INDEX_OPTIONS = [
  "Scopus",
  "Web of Science",
  "PubMed/MEDLINE",
  "ERIC",
  "African Journals Online (AJOL)",
  "Google Scholar indexed",
  "Other recognised index",
  "Not indexed",
];

const SDG_OPTIONS = [
  "SDG 1 – No Poverty",
  "SDG 2 – Zero Hunger",
  "SDG 3 – Good Health and Well-being",
  "SDG 4 – Quality Education",
  "SDG 5 – Gender Equality",
  "SDG 6 – Clean Water and Sanitation",
  "SDG 7 – Affordable and Clean Energy",
  "SDG 8 – Decent Work and Economic Growth",
  "SDG 9 – Industry, Innovation and Infrastructure",
  "SDG 10 – Reduced Inequalities",
  "SDG 11 – Sustainable Cities and Communities",
  "SDG 12 – Responsible Consumption and Production",
  "SDG 13 – Climate Action",
  "SDG 14 – Life Below Water",
  "SDG 15 – Life on Land",
  "SDG 16 – Peace, Justice and Strong Institutions",
  "SDG 17 – Partnerships for the Goals",
  "No specific SDG alignment",
];

const OUTPUT_STATUS_OPTIONS = [
  "Final research report completed",
  "Journal article published",
  "Journal article accepted/in press",
  "Book/book chapter published",
  "Conference paper presented/published",
  "Policy brief/report produced",
  "Patent/intellectual property registered",
  "Prototype/innovation developed",
  "Dataset produced",
  "Other",
];

/* ─── Reusable checkbox-group component ─────────────────────────── */
function CheckboxGroup({ options, selected, onChange, columns = 1 }) {
  const toggle = (opt) => {
    const current = Array.isArray(selected) ? selected : [];
    onChange(
      current.includes(opt) ? current.filter((x) => x !== opt) : [...current, opt]
    );
  };
  return (
    <div className={`grid gap-2 ${columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
      {options.map((opt) => {
        const checked = Array.isArray(selected) && selected.includes(opt);
        return (
          <label
            key={opt}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 px-3 py-2.5 transition hover:bg-slate-50"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(opt)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded accent-blue-600"
            />
            <span className="text-sm leading-snug text-slate-700">{opt}</span>
          </label>
        );
      })}
    </div>
  );
}

/* ─── Authorship multi-select ────────────────────────────────────── */
function AuthorshipField({ value, onChange }) {
  const selected = Array.isArray(value) ? value : [];

  const toggle = (opt) => {
    onChange(
      selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt]
    );
  };

  const isCoOOU = selected.includes("Co-authored with OOU staff");
  const isCollab = selected.includes("Research collaboration with other institutions");

  const COLLAB_OPTIONS = [
    "Nigerian University",
    "Foreign University",
    "Research Institute/Centre",
    "Government Institution/Agency",
    "Industry/Private Sector",
    "NGO/Foundation",
    "International Organisation",
    "Other",
  ];

  return (
    <div className="space-y-2">
      {["Sole authorship", "Co-authored with OOU staff", "Research collaboration with other institutions"].map((opt) => {
        const checked = selected.includes(opt);
        return (
          <label key={opt} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 px-3 py-2.5 transition hover:bg-slate-50">
            <input type="checkbox" checked={checked} onChange={() => toggle(opt)} className="mt-0.5 h-4 w-4 shrink-0 rounded accent-blue-600" />
            <span className="text-sm leading-snug text-slate-700">{opt}</span>
          </label>
        );
      })}

      {/* Sub-field: OOU department */}
      {isCoOOU && (
        <div className="ml-7">
          <label className={labelClass}>Department / Faculty of OOU Co-author(s)</label>
          <input
            type="text"
            value={selected.find((s) => s.startsWith("OOU Dept: "))?.replace("OOU Dept: ", "") || ""}
            onChange={(e) => {
              const filtered = selected.filter((s) => !s.startsWith("OOU Dept: "));
              onChange(e.target.value ? [...filtered, `OOU Dept: ${e.target.value}`] : filtered);
            }}
            className={inputClass}
            placeholder="e.g. Department of Chemistry, Faculty of Science"
          />
        </div>
      )}

      {/* Sub-checkboxes: collaboration types */}
      {isCollab && (
        <div className="ml-7 space-y-2">
          <p className={labelClass}>Type of collaborating institution(s)</p>
          {COLLAB_OPTIONS.map((opt) => {
            const key = `Collab: ${opt}`;
            const checked = selected.includes(key);
            return (
              <label key={opt} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 px-3 py-2.5 transition hover:bg-slate-50">
                <input type="checkbox" checked={checked} onChange={() => toggle(key)} className="mt-0.5 h-4 w-4 shrink-0 rounded accent-blue-600" />
                <span className="text-sm leading-snug text-slate-700">{opt}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Activity card ──────────────────────────────────────────────── */
function ActivityCard({ children, onEdit, onDelete }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5">
      <div className="min-w-0 flex-1 space-y-0.5">{children}</div>
      <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
        <button onClick={onEdit} className="rounded-lg border border-blue-100 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50">Edit</button>
        <button onClick={onDelete} className="rounded-lg border border-rose-100 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50">Delete</button>
      </div>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────── */
function EmptyState({ label }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
      <p className="text-sm text-slate-400">{label || "No entries yet."}</p>
    </div>
  );
}

/* ─── Section heading ────────────────────────────────────────────── */
function SectionHeading({ title, subtitle }) {
  return (
    <div>
      <h3 className="text-base font-bold text-slate-900 sm:text-lg">{title}</h3>
      {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

/* ─── Sub-group label ────────────────────────────────────────────── */
function SubGroupLabel({ children }) {
  return <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{children}</h4>;
}

/* ─── Modal ──────────────────────────────────────────────────────── */
function Modal({ open, onClose, title, subtitle, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="w-full max-w-2xl rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl sm:mx-4 max-h-[92dvh] flex flex-col">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 id="modal-title" className="text-base font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   SIMPLE CRUD SECTION (used by Active Projects, Completed Projects, PhD)
   ════════════════════════════════════════════════════════════════════ */
function SimpleCrudSection({ endpoint, sectionTitle, sectionSubtitle, renderFormFields, renderCard, emptyLabel, modalTitle }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get(endpoint);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const setField = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const setJsonField = (name, val) => setForm((prev) => ({ ...prev, [name]: val }));

  const openAdd = () => { setEditing(null); setForm({}); setError(""); setShowModal(true); };
  const openEdit = (item) => { setEditing(item.id); setForm({ ...item }); setError(""); setShowModal(true); };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry? This cannot be undone.")) return;
    try { await api.delete(`${endpoint}${id}/`); fetchData(); }
    catch (e) { console.error(e); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      editing ? await api.put(`${endpoint}${editing}/`, form) : await api.post(endpoint, form);
      setShowModal(false);
      setEditing(null);
      setForm({});
      fetchData();
    } catch (e) {
      const data = e.response?.data;
      if (data && typeof data === "object") {
        const msgs = Object.entries(data).map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(" ") : m}`).join("  |  ");
        setError(msgs || "Save failed.");
      } else {
        setError("Save failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeading title={sectionTitle} subtitle={sectionSubtitle} />
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add New
        </button>
      </div>

      {loading ? (
        <p className="py-4 text-sm text-slate-500">Loading…</p>
      ) : data.length === 0 ? (
        <EmptyState label={emptyLabel} />
      ) : (
        <div className="space-y-2.5">
          {data.map((item) => renderCard(item, () => openEdit(item), () => handleDelete(item.id)))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? `Edit ${modalTitle}` : `Add ${modalTitle}`}>
        <form onSubmit={handleSave} className="space-y-4">
          {renderFormFields(form, setField, setJsonField)}
          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
          <div className="flex gap-2.5 border-t border-slate-200 pt-4">
            <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60">
              {submitting ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════════ */
function MyResearch() {
  const [activeTab, setActiveTab] = useState("publications");
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("publications");
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const tabs = [
    { id: "publications", label: "Publications" },
    { id: "conferences_attended", label: "Conferences" },
    { id: "grants", label: "Grants" },
    { id: "innovations", label: "Innovations" },
    { id: "patents", label: "Patents" },
    { id: "active_projects", label: "Active Projects" },
    { id: "completed_projects", label: "Completed Projects" },
    { id: "phd_theses", label: "PhD Theses" },
  ];

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

  useEffect(() => { refreshActivities(); }, []);

  /* ── DOI auto-fill ─────────────────────────────────────────────── */
  const inferPublicationScope = (work) => {
    const location = String(work?.["publisher-location"] || "").toLowerCase();
    if (!location) return "";
    return location.includes("nigeria") ? "local" : "foreign";
  };

  const fetchDOIDetails = async (doi) => {
    if (!doi) return;
    setLoading(true);
    try {
      const response = await fetch(`https://api.crossref.org/works/${doi}`);
      const data = await response.json();
      const work = data.message;
      let publicationType = "";
      if (work.type === "journal-article") publicationType = "journal";
      else if (["book", "monograph", "book-chapter"].includes(work.type)) publicationType = "book";
      else if (work.type === "proceedings-article") publicationType = "conference";
      setFormData((prev) => ({
        ...prev,
        title: work.title?.[0] || "",
        bookTitle: publicationType === "book" ? work["container-title"]?.[0] || prev.bookTitle || "" : prev.bookTitle || "",
        authors: work.author?.map((a) => `${a.given || ""} ${a.family || ""}`).join(", ") || "",
        journal: publicationType === "book" ? work.publisher || work["container-title"]?.[0] || "" : work["container-title"]?.[0] || "",
        volume: work.volume || "",
        issue: work.issue || "",
        publicationYear: String(work.published?.["date-parts"]?.[0]?.[0] || work.issued?.["date-parts"]?.[0]?.[0] || ""),
        publicationType,
        publicationScope: prev.publicationScope || inferPublicationScope(work),
        doi: work.DOI || doi,
        no_of_citations: work["reference-count"] ?? prev.no_of_citations ?? "",
      }));
    } catch (err) {
      console.error("Error fetching DOI details:", err);
    }
    setLoading(false);
  };

  const handleDOIBlur = (e) => {
    const doi = e.target.value.replace("https://doi.org/", "").replace("http://dx.doi.org/", "");
    if (doi) fetchDOIDetails(doi);
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* Helper: toggle a value in a JSONField array stored in formData */
  const toggleJsonField = (fieldName, value) => {
    setFormData((prev) => {
      const current = Array.isArray(prev[fieldName]) ? prev[fieldName] : [];
      return {
        ...prev,
        [fieldName]: current.includes(value)
          ? current.filter((x) => x !== value)
          : [...current, value],
      };
    });
  };

  /* ── Modal open ────────────────────────────────────────────────── */
  const handleModalOpen = () => {
    // Only open the shared modal for the 5 research-activity categories
    const activityTabs = ["publications", "conferences_attended", "grants", "innovations", "patents"];
    if (!activityTabs.includes(activeTab)) return;
    setSelectedCategory(activeTab);
    setFormData({});
    setSubmitError("");
    setEditingId(null);
    setShowModal(true);
  };

  /* ── Edit handlers ─────────────────────────────────────────────── */
  const handleEditPublication = (activity) => {
    const map = { journals: "journal", books: "book", conferences: "conference" };
    setSelectedCategory("publications");
    setEditingId(activity.id);
    setFormData({
      doi: activity.doi || "",
      publicationType: map[activity.subcategory] || "",
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
      no_of_citations: activity.no_of_citations ?? "",
      authorship: Array.isArray(activity.authorship) ? activity.authorship : [],
      journal_index: Array.isArray(activity.journal_index) ? activity.journal_index : [],
      sdg_alignment: Array.isArray(activity.sdg_alignment) ? activity.sdg_alignment : [],
    });
    setSubmitError("");
    setShowModal(true);
  };

  const handleEditConference = (activity) => {
    const conferenceType = activity.description?.startsWith("Type: ") ? activity.description.replace("Type: ", "") : "";
    setSelectedCategory("conferences_attended");
    setEditingId(activity.id);
    setFormData({ conferenceName: activity.conference_name || "", presentationTitle: activity.title || "", conferenceLocation: activity.location || "", conferenceDate: activity.date || "", conferenceType });
    setSubmitError("");
    setShowModal(true);
  };

  const handleEditGrant = (activity) => {
    setSelectedCategory("grants");
    setEditingId(activity.id);
    setFormData({ grantTitle: activity.title || "", grantNumber: activity.grant_number || "", fundingAgency: activity.funding_agency || "", grantAmount: activity.amount != null ? String(activity.amount) : "", grantCurrency: activity.currency || "", grantStartDate: activity.start_date || activity.date || "", grantEndDate: activity.end_date || "", grantStatus: activity.status || "", grantDescription: activity.description || "" });
    setSubmitError("");
    setShowModal(true);
  };

  const handleEditInnovation = (activity) => {
    setSelectedCategory("innovations");
    setEditingId(activity.id);
    setFormData({ innovationTitle: activity.title || "", innovationType: activity.subcategory || "", industryPartner: activity.collaborators || "", innovationDate: activity.date || "", innovationDescription: activity.description || "" });
    setSubmitError("");
    setShowModal(true);
  };

  const handleEditPatent = (activity) => {
    let patentInventors = "";
    let patentAbstract = "";
    if (activity.description) {
      const parts = activity.description.split("\n\n");
      if (parts[0]?.startsWith("Inventors: ")) { patentInventors = parts[0].replace("Inventors: ", ""); patentAbstract = parts.slice(1).join("\n\n"); }
      else { patentAbstract = activity.description; }
    }
    setSelectedCategory("patents");
    setEditingId(activity.id);
    setFormData({ patentTitle: activity.title || "", patentNumber: activity.patent_number || "", patentAgency: activity.patent_agency || "", patentStatus: activity.patent_status || "", patentFilingDate: activity.date || "", patentInventors, patentAbstract });
    setSubmitError("");
    setShowModal(true);
  };

  /* ── Delete ────────────────────────────────────────────────────── */
  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm("Delete this entry? This cannot be undone.")) return;
    try {
      await api.delete(`research-activities/${activityId}/`);
      setActivities((prev) => prev.filter((item) => item.id !== activityId));
    } catch (err) { console.error(err); }
  };

  /* ── Build API payload ─────────────────────────────────────────── */
  const buildPayload = () => {
    const base = { category: selectedCategory };
    if (selectedCategory === "publications") {
      const subcategoryMap = { journal: "journals", book: "books", conference: "conferences" };
      return {
        ...base,
        subcategory: subcategoryMap[formData.publicationType] || null,
        title: formData.title || "",
        book_title: formData.bookTitle || "",
        editors: formData.editors || "",
        authors: formData.authors || "",
        journal_name: formData.journal || "",
        volume: formData.publicationType === "book" ? "" : formData.volume || "",
        issue: formData.publicationType === "book" ? "" : formData.issue || "",
        publication_scope: formData.publicationScope || "",
        journal_quartile: formData.journalQuartile || "",
        doi: formData.doi || "",
        year: formData.publicationYear || "",
        no_of_citations: formData.no_of_citations !== "" && formData.no_of_citations != null
          ? Number(formData.no_of_citations)
          : null,
        authorship: Array.isArray(formData.authorship) ? formData.authorship : [],
        journal_index: Array.isArray(formData.journal_index) ? formData.journal_index : [],
        sdg_alignment: Array.isArray(formData.sdg_alignment) ? formData.sdg_alignment : [],
      };
    }
    if (selectedCategory === "conferences_attended") {
      const yr = formData.conferenceDate ? Number(formData.conferenceDate.split("-")[0]) : null;
      return { ...base, title: formData.presentationTitle || "", conference_name: formData.conferenceName || "", location: formData.conferenceLocation || "", date: formData.conferenceDate || "", year: yr, description: formData.conferenceType ? `Type: ${formData.conferenceType}` : "" };
    }
    if (selectedCategory === "grants") {
      const yr = formData.grantStartDate ? Number(formData.grantStartDate.split("-")[0]) : null;
      return { ...base, title: formData.grantTitle || "", grant_number: formData.grantNumber || "", funding_agency: formData.fundingAgency || "", amount: formData.grantAmount ? Number(formData.grantAmount) : null, currency: formData.grantCurrency || "", start_date: formData.grantStartDate || null, end_date: formData.grantEndDate || null, status: formData.grantStatus || "", date: formData.grantStartDate || "", year: yr, description: formData.grantDescription || "" };
    }
    if (selectedCategory === "innovations") {
      const yr = formData.innovationDate ? Number(formData.innovationDate.split("-")[0]) : null;
      return { ...base, title: formData.innovationTitle || "", subcategory: formData.innovationType || null, collaborators: formData.industryPartner || "", date: formData.innovationDate || "", year: yr, description: formData.innovationDescription || "" };
    }
    if (selectedCategory === "patents") {
      const parts = [];
      if (formData.patentInventors) parts.push(`Inventors: ${formData.patentInventors}`);
      if (formData.patentAbstract) parts.push(formData.patentAbstract);
      const yr = formData.patentFilingDate ? Number(formData.patentFilingDate.split("-")[0]) : null;
      return { ...base, title: formData.patentTitle || "", patent_number: formData.patentNumber || "", patent_status: formData.patentStatus || "", patent_agency: formData.patentAgency || "", date: formData.patentFilingDate || "", year: yr, description: parts.join("\n\n") };
    }
    return base;
  };

  /* ── Submit (research activities) ─────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const isBlank = (v) => String(v || "").trim().length === 0;
      if (selectedCategory === "publications") {
        const required = [formData.publicationType, formData.title, formData.authors, formData.journal, formData.publicationYear, formData.publicationScope, formData.journalQuartile];
        if (formData.publicationType === "book") required.push(formData.bookTitle);
        if (required.some(isBlank)) { setSubmitError("Please complete all required fields."); setSubmitting(false); return; }

        const missingArrayFields = [];
        if (!Array.isArray(formData.authorship) || formData.authorship.length === 0) missingArrayFields.push("Authorship");
        if (!Array.isArray(formData.journal_index) || formData.journal_index.length === 0) missingArrayFields.push("Journal Index");
        if (!Array.isArray(formData.sdg_alignment) || formData.sdg_alignment.length === 0) missingArrayFields.push("SDG Alignment");
        if (missingArrayFields.length > 0) {
          setSubmitError(`Please select at least one option for: ${missingArrayFields.join(", ")}.`);
          setSubmitting(false);
          return;
        }
      }
      const payload = buildPayload();
      if (editingId) { await api.put(`research-activities/${editingId}/`, payload); }
      else { await api.post("research-activities/", payload); }
      await refreshActivities();
      setShowModal(false);
      setFormData({});
    } catch (err) {
      console.error("Error saving:", err);
      setSubmitError("Unable to save. Please review the form and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Form fields per category ──────────────────────────────────── */
  const renderFormFields = () => {
    switch (selectedCategory) {
      case "publications":
        return (
          <>
            {/* DOI */}
            <div>
              <label className={labelClass}>DOI / URL</label>
              <div className="flex gap-2">
                <input type="text" name="doi" value={formData.doi || ""} onBlur={handleDOIBlur} onChange={handleFieldChange} className={`${inputClass} flex-1`} placeholder="Paste DOI to auto-fill" />
                {loading && <span className="self-center text-xs text-blue-600 whitespace-nowrap">Loading…</span>}
              </div>
            </div>
            {/* Publication Type */}
            <div>
              <label className={labelClass}>Publication Type *</label>
              <select name="publicationType" value={formData.publicationType || ""} onChange={handleFieldChange} required className={inputClass}>
                <option value="">Select type</option>
                <option value="journal">Journal Article</option>
                <option value="book">Book</option>
                <option value="conference">Conference Publication</option>
              </select>
            </div>
            {/* Title */}
            <div>
              <label className={labelClass}>{formData.publicationType === "book" ? "Title of Chapter/Paper *" : "Title *"}</label>
              <input type="text" name="title" value={formData.title || ""} onChange={handleFieldChange} required className={inputClass} />
            </div>
            {/* Authors */}
            <div>
              <label className={labelClass}>Authors *</label>
              <input type="text" name="authors" value={formData.authors || ""} onChange={handleFieldChange} required className={inputClass} />
            </div>
            {/* Book-specific */}
            {formData.publicationType === "book" ? (
              <>
                <div><label className={labelClass}>Title of Book *</label><input type="text" name="bookTitle" value={formData.bookTitle || ""} onChange={handleFieldChange} required className={inputClass} /></div>
                <div><label className={labelClass}>Publisher *</label><input type="text" name="journal" value={formData.journal || ""} onChange={handleFieldChange} required className={inputClass} /></div>
                <div><label className={labelClass}>Editors</label><input type="text" name="editors" value={formData.editors || ""} onChange={handleFieldChange} placeholder="Optional" className={inputClass} /></div>
              </>
            ) : (
              <div><label className={labelClass}>Journal / Publisher *</label><input type="text" name="journal" value={formData.journal || ""} onChange={handleFieldChange} required className={inputClass} /></div>
            )}
            {/* Year */}
            <div>
              <label className={labelClass}>Publication Year *</label>
              <input type="number" name="publicationYear" min="1980" max={new Date().getFullYear() + 1} value={formData.publicationYear || ""} onChange={handleFieldChange} required className={inputClass} />
            </div>
            {/* Volume / Issue */}
            {formData.publicationType !== "book" && (
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Volume</label><input type="text" name="volume" value={formData.volume || ""} onChange={handleFieldChange} className={inputClass} /></div>
                <div><label className={labelClass}>Issue</label><input type="text" name="issue" value={formData.issue || ""} onChange={handleFieldChange} className={inputClass} /></div>
              </div>
            )}
            {/* Scope */}
            <div>
              <label className={labelClass}>Scope *</label>
              <select name="publicationScope" value={formData.publicationScope || ""} onChange={handleFieldChange} required className={inputClass}>
                <option value="">Select scope</option>
                {publicationScopeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {/* Quartile */}
            <div>
              <label className={labelClass}>Publication Quartile *</label>
              <select name="journalQuartile" value={formData.journalQuartile || ""} onChange={handleFieldChange} required className={inputClass}>
                <option value="">Select quartile</option>
                {journalQuartileOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Number of Citations */}
            <div>
              <label className={labelClass}>Number of Citations *</label>
              <input
                type="number"
                name="no_of_citations"
                min="0"
                value={formData.no_of_citations ?? ""}
                onChange={handleFieldChange}
                className={inputClass}
                required
              />
            </div>

            {/* ── Authorship ── */}
            <div>
              <label className={labelClass}>Authorship *</label>
              <AuthorshipField
                value={formData.authorship}
                onChange={(val) => setFormData((prev) => ({ ...prev, authorship: val }))}
              />
            </div>

            {/* ── Journal Index ── */}
            <div>
              <label className={labelClass}>Journal Index *</label>
              <CheckboxGroup
                options={JOURNAL_INDEX_OPTIONS}
                selected={formData.journal_index}
                onChange={(val) => setFormData((prev) => ({ ...prev, journal_index: val }))}
              />
            </div>

            {/* ── SDG Alignment ── */}
            <div>
              <label className={labelClass}>SDG Alignment *</label>
              <CheckboxGroup
                options={SDG_OPTIONS}
                selected={formData.sdg_alignment}
                onChange={(val) => setFormData((prev) => ({ ...prev, sdg_alignment: val }))}
                columns={2}
              />
            </div>
          </>
        );

      case "conferences_attended":
        return (
          <>
            <div><label className={labelClass}>Conference Name</label><input type="text" name="conferenceName" value={formData.conferenceName || ""} onChange={handleFieldChange} className={inputClass} /></div>
            <div><label className={labelClass}>Presentation Title</label><input type="text" name="presentationTitle" value={formData.presentationTitle || ""} onChange={handleFieldChange} className={inputClass} /></div>
            <div><label className={labelClass}>Location</label><input type="text" name="conferenceLocation" value={formData.conferenceLocation || ""} onChange={handleFieldChange} className={inputClass} /></div>
            <div><label className={labelClass}>Date</label><input type="date" name="conferenceDate" value={formData.conferenceDate || ""} onChange={handleFieldChange} className={inputClass} /></div>
            <div>
              <label className={labelClass}>Type</label>
              <select name="conferenceType" value={formData.conferenceType || ""} onChange={handleFieldChange} className={inputClass}>
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
            <div><label className={labelClass}>Grant Title</label><input type="text" name="grantTitle" value={formData.grantTitle || ""} onChange={handleFieldChange} className={inputClass} /></div>
            <div><label className={labelClass}>Grant Number</label><input type="text" name="grantNumber" value={formData.grantNumber || ""} onChange={handleFieldChange} className={inputClass} /></div>
            <div><label className={labelClass}>Funding Agency</label><input type="text" name="fundingAgency" value={formData.fundingAgency || ""} onChange={handleFieldChange} className={inputClass} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Amount</label><input type="number" name="grantAmount" value={formData.grantAmount || ""} onChange={handleFieldChange} className={inputClass} /></div>
              <div><label className={labelClass}>Currency</label><input type="text" name="grantCurrency" value={formData.grantCurrency || ""} onChange={handleFieldChange} className={inputClass} placeholder="NGN, USD…" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Start Date</label><input type="date" name="grantStartDate" value={formData.grantStartDate || ""} onChange={handleFieldChange} className={inputClass} /></div>
              <div><label className={labelClass}>End Date</label><input type="date" name="grantEndDate" value={formData.grantEndDate || ""} onChange={handleFieldChange} className={inputClass} /></div>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select name="grantStatus" value={formData.grantStatus || ""} onChange={handleFieldChange} className={inputClass}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div><label className={labelClass}>Description</label><textarea name="grantDescription" value={formData.grantDescription || ""} onChange={handleFieldChange} className={`${inputClass} h-24 resize-none`} placeholder="Optional details" /></div>
          </>
        );

      case "innovations":
        return (
          <>
            <div><label className={labelClass}>Innovation Title</label><input type="text" name="innovationTitle" value={formData.innovationTitle || ""} onChange={handleFieldChange} className={inputClass} /></div>
            <div>
              <label className={labelClass}>Type</label>
              <select name="innovationType" value={formData.innovationType || ""} onChange={handleFieldChange} className={inputClass}>
                <option value="prototype">Prototype</option>
                <option value="software">Software/Tool</option>
                <option value="technology_transfer">Technology Transfer</option>
              </select>
            </div>
            <div><label className={labelClass}>Development Date</label><input type="date" name="innovationDate" value={formData.innovationDate || ""} onChange={handleFieldChange} className={inputClass} /></div>
            <div><label className={labelClass}>Industry Partner</label><input type="text" name="industryPartner" value={formData.industryPartner || ""} onChange={handleFieldChange} className={inputClass} placeholder="If applicable" /></div>
            <div><label className={labelClass}>Description</label><textarea name="innovationDescription" value={formData.innovationDescription || ""} onChange={handleFieldChange} className={`${inputClass} h-24 resize-none`} /></div>
          </>
        );

      case "patents":
        return (
          <>
            <div><label className={labelClass}>Patent Title</label><input type="text" name="patentTitle" value={formData.patentTitle || ""} onChange={handleFieldChange} className={inputClass} /></div>
            <div><label className={labelClass}>Inventors</label><input type="text" name="patentInventors" value={formData.patentInventors || ""} onChange={handleFieldChange} className={inputClass} /></div>
            <div><label className={labelClass}>Patent Number</label><input type="text" name="patentNumber" value={formData.patentNumber || ""} onChange={handleFieldChange} className={inputClass} /></div>
            <div><label className={labelClass}>Patent Agency</label><input type="text" name="patentAgency" value={formData.patentAgency || ""} onChange={handleFieldChange} className={inputClass} placeholder="e.g. USPTO, EPO, NOTAP" /></div>
            <div><label className={labelClass}>Filing Date</label><input type="date" name="patentFilingDate" value={formData.patentFilingDate || ""} onChange={handleFieldChange} className={inputClass} /></div>
            <div>
              <label className={labelClass}>Status</label>
              <select name="patentStatus" value={formData.patentStatus || ""} onChange={handleFieldChange} className={inputClass}>
                <option value="filed">Filed</option>
                <option value="granted">Granted</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div><label className={labelClass}>Abstract</label><textarea name="patentAbstract" value={formData.patentAbstract || ""} onChange={handleFieldChange} className={`${inputClass} h-24 resize-none`} /></div>
          </>
        );

      default:
        return null;
    }
  };

  /* ── Tab content ───────────────────────────────────────────────── */
  const renderContent = () => {
    /* ── Research activities (existing 5 tabs) ─────────────────── */
    if (activeTab === "publications") {
      const publications = activities.filter((a) => a.category === "publications");
      const groups = [
        { id: "journals", label: "Journal Articles" },
        { id: "books", label: "Books" },
        { id: "conferences", label: "Conference Publications" },
      ];
      return (
        <div className="space-y-6">
          <SectionHeading title="Publications" subtitle="Manage your research publications." />
          {loadingActivities ? <p className="text-sm text-slate-500">Loading…</p> : (
            groups.map((group) => {
              const items = publications.filter((a) => a.subcategory === group.id);
              return (
                <div key={group.id} className="space-y-3">
                  <SubGroupLabel>{group.label}</SubGroupLabel>
                  {items.length === 0 ? <EmptyState label={`No ${group.label.toLowerCase()} yet.`} /> : (
                    <div className="space-y-2.5">
                      {items.map((item) => (
                        <ActivityCard key={item.id} onEdit={() => handleEditPublication(item)} onDelete={() => handleDeleteActivity(item.id)}>
                          <p className="font-semibold text-slate-900 leading-snug">{item.title || "Untitled"}</p>
                          <p className="text-xs text-slate-500">{item.authors || "—"}</p>
                          <p className="text-xs text-slate-400">
                            {item.subcategory === "books" ? item.book_title || "—" : item.journal_name || "—"}
                            {item.year ? ` · ${item.year}` : ""}
                            {item.publication_scope ? ` · ${publicationScopeLabels[item.publication_scope] || item.publication_scope}` : ""}
                            {item.journal_quartile ? ` · ${journalQuartileLabels[item.journal_quartile] || item.journal_quartile}` : ""}
                            {item.no_of_citations != null ? ` · ${item.no_of_citations} citation${item.no_of_citations !== 1 ? "s" : ""}` : ""}
                          </p>
                          {item.journal_index?.length > 0 && (
                            <p className="text-xs text-slate-400">Index: {item.journal_index.join(", ")}</p>
                          )}
                          {item.sdg_alignment?.length > 0 && (
                            <p className="text-xs text-slate-400">SDGs: {item.sdg_alignment.join(", ")}</p>
                          )}
                        </ActivityCard>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      );
    }

    if (activeTab === "conferences_attended") {
      const items = activities.filter((a) => a.category === "conferences_attended");
      return (
        <div className="space-y-5">
          <SectionHeading title="Conferences Attended" subtitle="Track your conference attendance." />
          {loadingActivities ? <p className="text-sm text-slate-500">Loading…</p> : (
            items.length === 0 ? <EmptyState label="No conference entries yet." /> : (
              <div className="space-y-2.5">
                {items.map((item) => (
                  <ActivityCard key={item.id} onEdit={() => handleEditConference(item)} onDelete={() => handleDeleteActivity(item.id)}>
                    <p className="font-semibold text-slate-900">{item.conference_name || "Unnamed Conference"}</p>
                    <p className="text-xs text-slate-500">{item.title || "—"}</p>
                    <p className="text-xs text-slate-400">{item.location || "—"}{item.date ? ` · ${item.date}` : ""}{item.description ? ` · ${item.description.replace("Type: ", "")}` : ""}</p>
                  </ActivityCard>
                ))}
              </div>
            )
          )}
        </div>
      );
    }

    if (activeTab === "grants") {
      const items = activities.filter((a) => a.category === "grants");
      return (
        <div className="space-y-5">
          <SectionHeading title="Grants" subtitle="Monitor your research grants." />
          {loadingActivities ? <p className="text-sm text-slate-500">Loading…</p> : (
            items.length === 0 ? <EmptyState label="No grant entries yet." /> : (
              <div className="space-y-2.5">
                {items.map((item) => {
                  const amount = item.amount != null && item.amount !== "" ? `${item.currency || ""} ${item.amount}`.trim() : null;
                  return (
                    <ActivityCard key={item.id} onEdit={() => handleEditGrant(item)} onDelete={() => handleDeleteActivity(item.id)}>
                      <p className="font-semibold text-slate-900">{item.title || "Untitled"}</p>
                      <p className="text-xs text-slate-500">{item.funding_agency || "—"}{item.grant_number ? ` · ${item.grant_number}` : ""}</p>
                      <p className="text-xs text-slate-400">{amount ? `${amount} · ` : ""}{item.start_date || item.date || "—"}{item.end_date ? ` → ${item.end_date}` : ""}{item.status ? ` · ${item.status}` : ""}</p>
                    </ActivityCard>
                  );
                })}
              </div>
            )
          )}
        </div>
      );
    }

    if (activeTab === "innovations") {
      const items = activities.filter((a) => a.category === "innovations");
      return (
        <div className="space-y-5">
          <SectionHeading title="Innovations" subtitle="Track your innovations and technology transfer." />
          {loadingActivities ? <p className="text-sm text-slate-500">Loading…</p> : (
            items.length === 0 ? <EmptyState label="No innovation entries yet." /> : (
              <div className="space-y-2.5">
                {items.map((item) => (
                  <ActivityCard key={item.id} onEdit={() => handleEditInnovation(item)} onDelete={() => handleDeleteActivity(item.id)}>
                    <p className="font-semibold text-slate-900">{item.title || "Untitled"}</p>
                    <p className="text-xs text-slate-500">{item.subcategory || "—"}{item.collaborators ? ` · ${item.collaborators}` : ""}</p>
                    {item.date && <p className="text-xs text-slate-400">{item.date}</p>}
                  </ActivityCard>
                ))}
              </div>
            )
          )}
        </div>
      );
    }

    if (activeTab === "patents") {
      const items = activities.filter((a) => a.category === "patents");
      return (
        <div className="space-y-5">
          <SectionHeading title="Patents" subtitle="Track your patents." />
          {loadingActivities ? <p className="text-sm text-slate-500">Loading…</p> : (
            items.length === 0 ? <EmptyState label="No patent entries yet." /> : (
              <div className="space-y-2.5">
                {items.map((item) => (
                  <ActivityCard key={item.id} onEdit={() => handleEditPatent(item)} onDelete={() => handleDeleteActivity(item.id)}>
                    <p className="font-semibold text-slate-900">{item.title || "Untitled"}</p>
                    <p className="text-xs text-slate-500">{item.patent_number || "—"}{item.patent_agency ? ` · ${item.patent_agency}` : ""}</p>
                    <p className="text-xs text-slate-400">{item.patent_status || "—"}{item.date ? ` · ${item.date}` : ""}</p>
                  </ActivityCard>
                ))}
              </div>
            )
          )}
        </div>
      );
    }

    /* ── Active Research Projects ──────────────────────────────── */
    if (activeTab === "active_projects") {
      return (
        <SimpleCrudSection
          key="active_projects"
          endpoint="active-research-projects/"
          sectionTitle="Active Research Projects"
          sectionSubtitle="Research projects currently in progress."
          modalTitle="Active Research Project"
          emptyLabel="No active research projects yet."
          renderFormFields={(form, setField) => (
            <>
              <div><label className={labelClass}>Title of Research Project *</label><input name="title" value={form.title || ""} onChange={setField} required className={inputClass} /></div>
              <div><label className={labelClass}>Source of Funding</label><input name="source_of_funding" value={form.source_of_funding || ""} onChange={setField} className={inputClass} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Year Commenced *</label><input type="number" name="year_commenced" min="1980" max={new Date().getFullYear() + 5} value={form.year_commenced || ""} onChange={setField} required className={inputClass} /></div>
                <div><label className={labelClass}>Expected Year of Completion</label><input type="number" name="expected_year_of_completion" min="1980" max={new Date().getFullYear() + 20} value={form.expected_year_of_completion || ""} onChange={setField} className={inputClass} /></div>
              </div>
            </>
          )}
          renderCard={(item, onEdit, onDelete) => (
            <ActivityCard key={item.id} onEdit={onEdit} onDelete={onDelete}>
              <p className="font-semibold text-slate-900 leading-snug">{item.title}</p>
              {item.source_of_funding && <p className="text-xs text-slate-500">Funding: {item.source_of_funding}</p>}
              <p className="text-xs text-slate-400">
                Commenced: {item.year_commenced}
                {item.expected_year_of_completion ? ` · Expected completion: ${item.expected_year_of_completion}` : ""}
              </p>
            </ActivityCard>
          )}
        />
      );
    }

    /* ── Completed Research Projects ───────────────────────────── */
    if (activeTab === "completed_projects") {
      return (
        <SimpleCrudSection
          key="completed_projects"
          endpoint="completed-research-projects/"
          sectionTitle="Completed Research Projects"
          sectionSubtitle="Research projects that have been completed."
          modalTitle="Completed Research Project"
          emptyLabel="No completed research projects yet."
          renderFormFields={(form, setField, setJsonField) => (
            <>
              <div><label className={labelClass}>Title of Research Project *</label><input name="title" value={form.title || ""} onChange={setField} required className={inputClass} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Year Commenced *</label><input type="number" name="year_commenced" min="1980" max={new Date().getFullYear()} value={form.year_commenced || ""} onChange={setField} required className={inputClass} /></div>
                <div><label className={labelClass}>Year Completed *</label><input type="number" name="year_completed" min="1980" max={new Date().getFullYear() + 2} value={form.year_completed || ""} onChange={setField} required className={inputClass} /></div>
              </div>
              <div>
                <label className={labelClass}>Status of Final Research Output</label>
                <CheckboxGroup
                  options={OUTPUT_STATUS_OPTIONS}
                  selected={Array.isArray(form.output_status) ? form.output_status : []}
                  onChange={(val) => setJsonField("output_status", val)}
                />
              </div>
            </>
          )}
          renderCard={(item, onEdit, onDelete) => (
            <ActivityCard key={item.id} onEdit={onEdit} onDelete={onDelete}>
              <p className="font-semibold text-slate-900 leading-snug">{item.title}</p>
              <p className="text-xs text-slate-500">{item.year_commenced} → {item.year_completed}</p>
              {Array.isArray(item.output_status) && item.output_status.length > 0 && (
                <p className="text-xs text-slate-400">{item.output_status.join(" · ")}</p>
              )}
            </ActivityCard>
          )}
        />
      );
    }

    /* ── PhD Theses ────────────────────────────────────────────── */
    if (activeTab === "phd_theses") {
      return (
        <SimpleCrudSection
          key="phd_theses"
          endpoint="phd-theses/"
          sectionTitle="PhD Theses Supervised"
          sectionSubtitle="PhD research projects you have supervised to completion."
          modalTitle="PhD Thesis"
          emptyLabel="No PhD theses recorded yet."
          renderFormFields={(form, setField) => (
            <>
              <div><label className={labelClass}>Title of PhD Thesis / Research Project *</label><input name="title" value={form.title || ""} onChange={setField} required className={inputClass} /></div>
              <div><label className={labelClass}>Name of PhD Candidate *</label><input name="candidate_name" value={form.candidate_name || ""} onChange={setField} required className={inputClass} /></div>
              <div><label className={labelClass}>Year Degree was Awarded *</label><input type="number" name="year_awarded" min="1980" max={new Date().getFullYear() + 2} value={form.year_awarded || ""} onChange={setField} required className={inputClass} /></div>
              <div><label className={labelClass}>Research Area</label><input name="research_area" value={form.research_area || ""} onChange={setField} className={inputClass} placeholder="e.g. Machine Learning, Public Health" /></div>
            </>
          )}
          renderCard={(item, onEdit, onDelete) => (
            <ActivityCard key={item.id} onEdit={onEdit} onDelete={onDelete}>
              <p className="font-semibold text-slate-900 leading-snug">{item.title}</p>
              <p className="text-xs text-slate-500">{item.candidate_name}</p>
              <p className="text-xs text-slate-400">
                Awarded: {item.year_awarded}
                {item.research_area ? ` · ${item.research_area}` : ""}
              </p>
            </ActivityCard>
          )}
        />
      );
    }

    return null;
  };

  /* ── Is current tab a research-activity tab? ───────────────────── */
  const isActivityTab = ["publications", "conferences_attended", "grants", "innovations", "patents"].includes(activeTab);

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <Header />

      <main className="flex-1 w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">

          {/* Page header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">My Research</h2>
              <p className="mt-0.5 text-sm text-slate-500">Publications, projects, patents, conferences, and more.</p>
            </div>
            {/* Only show the shared "Add" button for the 5 research-activity tabs */}
            {isActivityTab && (
              <button
                onClick={handleModalOpen}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] sm:shrink-0"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Add New
              </button>
            )}
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

            {/* Mobile scrollable tab strip */}
            <div className="lg:hidden -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-56 shrink-0 self-start rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sticky top-24">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Categories</h3>
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                      activeTab === tab.id ? "bg-blue-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100 hover:text-blue-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Content panel */}
            <section className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              {renderContent()}
            </section>
          </div>
        </div>
      </main>

      {/* Shared modal for research-activity tabs */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Research Entry" : "Add New Research"}
        subtitle="Complete the required fields below."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Category</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={inputClass}>
              <option value="publications">Publications</option>
              <option value="conferences_attended">Conferences Attended</option>
              <option value="grants">Grants</option>
              <option value="innovations">Innovations</option>
              <option value="patents">Patents</option>
            </select>
          </div>

          {renderFormFields()}

          {submitError && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{submitError}</div>
          )}

          <div className="flex gap-2.5 border-t border-slate-200 pt-4">
            <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}

export default MyResearch;
