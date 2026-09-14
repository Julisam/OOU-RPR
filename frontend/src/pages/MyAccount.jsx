import { useEffect, useState, useCallback, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../api";
import { countries } from "../data/countries";

/* ─── Shared class constants ─────────────────────────────────────── */
const labelClass =
  "block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2";
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 " +
  "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70 sm:text-sm";
const selectClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 " +
  "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70 sm:text-sm";
const addButtonClass =
  "inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]";

/* ─── Icons ──────────────────────────────────────────────────────── */
function AddIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  );
}

function AcademicCapIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
      />
    </svg>
  );
}

function BeakerIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
      />
    </svg>
  );
}

/* ─── Modal ──────────────────────────────────────────────────────── */
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Sheet slides up from bottom on mobile, centred on sm+ */}
      <div className="w-full max-w-lg rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl sm:mx-4 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id="modal-title" className="text-base font-bold text-slate-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ─── Section switcher (top-level tabs) ─────────────────────────── */
function SectionSwitcher({ tab, setTab }) {
  return (
    /* Full-width on mobile, inline on sm+ */
    <div className="flex w-full rounded-2xl border border-slate-200 bg-slate-50 p-1.5 shadow-inner sm:w-auto sm:inline-flex">
      <button
        onClick={() => setTab("fellowships")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 sm:flex-none ${
          tab === "fellowships"
            ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <AcademicCapIcon
          className={`h-4 w-4 ${tab === "fellowships" ? "text-blue-600" : "text-slate-400"}`}
        />
        <span className="hidden xs:inline sm:inline">
          Fellowships &amp; Appointments
        </span>
        <span className="xs:hidden sm:hidden">Fellowships</span>
      </button>
      <button
        onClick={() => setTab("research")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 sm:flex-none ${
          tab === "research"
            ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <BeakerIcon
          className={`h-4 w-4 ${tab === "research" ? "text-blue-600" : "text-slate-400"}`}
        />
        Research Profile
      </button>
    </div>
  );
}

/* ─── Sub-tabs (scrollable on mobile) ───────────────────────────── */
function SubTabs({ tabs, active, onChange }) {
  return (
    <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex overflow-x-auto border-b border-slate-200 no-scrollbar">
        {tabs.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`relative shrink-0 pb-3 pr-6 text-sm font-semibold transition-colors ${
                isActive
                  ? "text-blue-700"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.label}
              <span
                className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full transition-all ${isActive ? "bg-blue-600" : "bg-transparent"}`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Card list item (mobile-friendly alternative to table rows) ─── */
function CardRow({ children, onEdit, onDelete }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5">
      <div className="min-w-0 flex-1 space-y-0.5">{children}</div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={onEdit}
          className="rounded-lg border border-blue-100 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg border border-rose-100 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
        >
          Delete
        </button>
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

/* ─── Form field helper ──────────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

/* ─── Searchable country select ──────────────────────────────────── */
/**
 * Props:
 *   value          – currently selected country string
 *   onChange       – (countryString) => void
 *   placeholder    – optional placeholder text
 *   id             – optional id for the input (for label association)
 */
function CountrySelect({
  value,
  onChange,
  placeholder = "Search country…",
  id,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // When the selected value changes from outside (e.g. editing an existing record),
  // keep the display in sync without forcing the dropdown open.
  const displayValue = open ? query : value || "";

  const filtered = query.trim()
    ? countries.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
    : countries;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
        // If the user typed something but didn't pick — reset to current value
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    // If the user clears the field, also clear the selected value
    if (e.target.value === "") onChange("");
  };

  const handleSelect = (country) => {
    onChange(country);
    setQuery("");
    setOpen(false);
  };

  const handleFocus = () => {
    setQuery("");
    setOpen(true);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Text input — shows selected value when closed, search query when open */}
      <div className="relative">
        <input
          id={id}
          type="text"
          autoComplete="off"
          value={open ? query : value || ""}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={value ? value : placeholder}
          className={inputClass + " pr-9" /* room for chevron */}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        {/* Chevron icon */}
        <span
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400"
          aria-hidden="true"
        >
          <svg
            className={`h-4 w-4 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </div>

      {/* Dropdown list */}
      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-400">
              No countries match "{query}"
            </li>
          ) : (
            filtered.map((country) => (
              <li
                key={country}
                role="option"
                aria-selected={country === value}
                onMouseDown={(e) => {
                  // mousedown fires before blur, preventing the outside-click handler
                  // from closing the dropdown before we register the selection
                  e.preventDefault();
                  handleSelect(country);
                }}
                className={`cursor-pointer px-4 py-2.5 text-sm transition-colors ${
                  country === value
                    ? "bg-blue-600 font-semibold text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {country}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   FELLOWSHIP SECTION
   ════════════════════════════════════════════════════════════════════ */
function FellowshipSection() {
  const [subTab, setSubTab] = useState("national");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const endpointMap = {
    national: "national-academy-fellowships/",
    international: "international-professional-fellowships/",
    visiting: "visiting-professorships/",
  };
  const endpoint = endpointMap[subTab];

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setField = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const openAdd = () => {
    setEditing(null);
    setForm({});
    setError("");
    setShowModal(true);
  };
  const openEdit = (item) => {
    setEditing(item.id);
    setForm({ ...item });
    setError("");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await api.delete(`${endpoint}${id}/`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const submissionForm =
        form.academy_type === "Other"
          ? { ...form, academy_type: form.custom_academy_type }
          : form;
      editing
        ? await api.put(`${endpoint}${editing}/`, submissionForm)
        : await api.post(endpoint, submissionForm);
      setShowModal(false);
      setEditing(null);
      setForm({});
      fetchData();
    } catch (e) {
      setError(e.response?.data?.detail || "Save failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderFormFields = () => {
    if (subTab === "national")
      return (
        <>
          <Field label="Name of National Academy">
            <input
              name="academy_name"
              value={form.academy_name || ""}
              onChange={setField}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Academy Type">
            <select
              name="academy_type"
              value={form.academy_type || ""}
              onChange={setField}
              className={selectClass}
              required
            >
              <option value="">Select type</option>
              <option value="National Academy of Science">
                National Academy of Science
              </option>
              <option value="National Academy of Engineering">
                National Academy of Engineering
              </option>
              <option value="National Academy of Medicine">
                National Academy of Medicine
              </option>
              <option value="National Academy of Education">
                National Academy of Education
              </option>
              <option value="National Academy of Letters/Arts">
                National Academy of Letters/Arts
              </option>
              <option value="Other">
                Other recognised national scholarly academy
              </option>
            </select>
          </Field>
          {form.academy_type === "Other" && (
            <Field label="Specify Academy Type">
              <input
                name="custom_academy_type"
                value={form.custom_academy_type || ""}
                onChange={setField}
                className={inputClass}
                placeholder="Enter academy type"
              />
            </Field>
          )}
          <Field label="Year Elected/Admitted as fellow">
            <input
              type="number"
              name="year_elected"
              min="1900"
              max="2200"
              value={form.year_elected || ""}
              onChange={setField}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Discipline Fellowship was Awarded">
            <input
              name="discipline"
              value={form.discipline || ""}
              onChange={setField}
              className={inputClass}
              required
            />
          </Field>
        </>
      );
    if (subTab === "international")
      return (
        <>
          <Field label="Name of International/Professional Body" required>
            <input
              name="body_name"
              value={form.body_name || ""}
              onChange={setField}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Country/International jurisdiction" required>
            <CountrySelect
              value={form.country || ""}
              onChange={(country) => setForm((prev) => ({ ...prev, country }))}
            />
          </Field>
          <Field label="Title/Designation of Fellowship">
            <input
              name="title"
              value={form.title || ""}
              onChange={setField}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Year Elected/Admitted as fellow">
            <input
              type="number"
              name="year_elected"
              min="1900"
              max="2200"
              value={form.year_elected || ""}
              onChange={setField}
              className={inputClass}
              required
            />
          </Field>
        </>
      );
    if (subTab === "visiting")
      return (
        <>
          <Field label="Host Institution">
            <input
              name="host_institution"
              value={form.host_institution || ""}
              onChange={setField}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Country" required>
            <CountrySelect
              value={form.country || ""}
              onChange={(country) => setForm((prev) => ({ ...prev, country }))}
            />
          </Field>
          <Field label="Title" required>
            <select
              name="title"
              value={form.title || ""}
              onChange={setField}
              className={selectClass}
              required
            >
              <option value="">Select title</option>
              <option value="visiting_professor">Visiting Professor</option>
              <option value="visiting_research_professor">
                Visiting Research Professor
              </option>
              <option value="visiting_scholar">Visiting Scholar</option>
            </select>
          </Field>
          <Field label="Year Appointed" required>
            <input
              type="number"
              name="year_appointed"
              min="1900"
              max="2200"
              value={form.year_appointed || ""}
              onChange={setField}
              className={inputClass}
            />
          </Field>
          <Field label="Duration">
            <div className="flex gap-2">
              <input
                type="number"
                name="duration_value"
                min="1"
                value={form.duration_value || ""}
                onChange={setField}
                className={`${inputClass} flex-1`}
                placeholder="e.g. 6"
                required
              />

              <select
                name="duration_unit"
                value={form.duration_unit || ""}
                onChange={setField}
                className={`${selectClass} flex-1`}
                required
              >
                <option value="">Select unit</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </Field>
        </>
      );
  };

  const renderCards = () => {
    if (data.length === 0)
      return <EmptyState label="No fellowship entries yet. Add one above." />;
    if (subTab === "national")
      return data.map((item) => (
        <CardRow
          key={item.id}
          onEdit={() => openEdit(item)}
          onDelete={() => handleDelete(item.id)}
        >
          <p className="font-semibold text-slate-900">{item.academy_name}</p>
          <p className="text-xs text-slate-500">
            {item.academy_type?.replace(/_/g, " ")} · {item.year_elected}
          </p>
          {item.discipline && (
            <p className="text-xs text-slate-400">{item.discipline}</p>
          )}
        </CardRow>
      ));
    if (subTab === "international")
      return data.map((item) => (
        <CardRow
          key={item.id}
          onEdit={() => openEdit(item)}
          onDelete={() => handleDelete(item.id)}
        >
          <p className="font-semibold text-slate-900">{item.body_name}</p>
          <p className="text-xs text-slate-500">
            {item.country} · {item.year_elected}
          </p>
          {item.title && <p className="text-xs text-slate-400">{item.title}</p>}
        </CardRow>
      ));
    if (subTab === "visiting")
      return data.map((item) => (
        <CardRow
          key={item.id}
          onEdit={() => openEdit(item)}
          onDelete={() => handleDelete(item.id)}
        >
          <p className="font-semibold text-slate-900">
            {item.host_institution}
          </p>
          <p className="text-xs text-slate-500">
            {item.country} · {item.year_appointed}
          </p>
          {item.title && (
            <p className="text-xs text-slate-400">
              {item.title?.replace(/_/g, " ")} · {item.duration}
            </p>
          )}
        </CardRow>
      ));
  };

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Fellowships &amp; Appointments
          </h3>
          <p className="text-sm text-slate-500">
            Manage your fellowships and academic appointments.
          </p>
        </div>
        <button onClick={openAdd} className={addButtonClass}>
          <AddIcon /> Add New
        </button>
      </div>

      <SubTabs
        tabs={[
          { id: "national", label: "National Academy" },
          { id: "international", label: "International Bodies" },
          { id: "visiting", label: "Visiting Professorships" },
        ]}
        active={subTab}
        onChange={(id) => {
          setSubTab(id);
        }}
      />

      {loading ? (
        <p className="py-4 text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="space-y-3">{renderCards()}</div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Entry" : "Add Entry"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {renderFormFields()}
          {error && (
            <p role="alert" className="text-sm text-rose-600">
              {error}
            </p>
          )}
          <div className="flex gap-2.5 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   RESEARCH SECTION
   ════════════════════════════════════════════════════════════════════ */
function ResearchSection() {
  const [subTab, setSubTab] = useState("awards");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const endpointMap = {
    awards: "research-awards/",
    editorial: "editorial-appointments/",
    groups: "research-group-memberships/",
  };
  const endpoint = endpointMap[subTab];

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
  }, [endpoint, subTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setField = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const openAdd = () => {
    setEditing(null);
    setForm({});
    setError("");
    setShowModal(true);
  };
  const openEdit = (item) => {
    setEditing(item.id);
    setForm({
      ...item,
      indexing_status: Array.isArray(item.indexing_status)
        ? item.indexing_status
        : [],
    });
    setError("");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await api.delete(`${endpoint}${id}/`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = { ...form };
      if (subTab === "editorial") {
        payload.indexing_status = Array.isArray(payload.indexing_status)
          ? payload.indexing_status
          : [];
      } else {
        delete payload.indexing_status;
      }
      editing
        ? await api.put(`${endpoint}${editing}/`, payload)
        : await api.post(endpoint, payload);
      setShowModal(false);
      setEditing(null);
      setForm({});
      fetchData();
    } catch (e) {
      const data = e.response?.data;
      if (data && typeof data === "object") {
        const messages = Object.entries(data)
          .map(([field, msgs]) =>
            Array.isArray(msgs)
              ? `${field}: ${msgs.join(" ")}`
              : `${field}: ${msgs}`,
          )
          .join("  |  ");
        setError(messages || "Save failed. Please try again.");
      } else {
        setError("Save failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleIndexStatus = (label) => {
    const current = Array.isArray(form.indexing_status)
      ? form.indexing_status
      : [];
    setForm((prev) => ({
      ...prev,
      indexing_status: current.includes(label)
        ? current.filter((x) => x !== label)
        : [...current, label],
    }));
  };

  const renderFormFields = () => {
    if (subTab === "awards")
      return (
        <>
          <Field label="Name of Award/Prize" required>
            <input
              name="award_name"
              value={form.award_name || ""}
              onChange={setField}
              className={inputClass}
            />
          </Field>
          <Field label="Awarding Organisation/Institution" required>
            <input
              name="awarding_organization"
              value={form.awarding_organization || ""}
              onChange={setField}
              className={inputClass}
            />
          </Field>
          <Field label="Country" required>
            <CountrySelect
              value={form.country || ""}
              onChange={(country) => setForm((prev) => ({ ...prev, country }))}
            />
          </Field>
          <Field label="Year Received" required>
            <input
              type="number"
              name="year_received"
              value={form.year_received || ""}
              min="1900"
              max="2200"
              onChange={setField}
              className={inputClass}
            />
          </Field>
          <Field label="Award Category/Type" required>
            <input
              name="award_category"
              value={form.award_category || ""}
              onChange={setField}
              className={inputClass}
            />
          </Field>
        </>
      );
    if (subTab === "editorial")
      return (
        <>
          <Field label="Name of Journal/Publication" required>
            <input
              name="journal_name"
              value={form.journal_name || ""}
              onChange={setField}
              className={inputClass}
            />
          </Field>
          <Field label="Publisher/Publishing Organization" required>
            <input
              name="publisher"
              value={form.publisher || ""}
              onChange={setField}
              className={inputClass}
            />
          </Field>
          <Field label="Country" required>
            <CountrySelect
              value={form.country || ""}
              onChange={(country) => setForm((prev) => ({ ...prev, country }))}
            />
          </Field>
          <Field label="Editorial Position" required>
            <select
              name="position"
              value={form.position || ""}
              onChange={setField}
              className={selectClass}
            >
              <option value="">Select position</option>
              <option value="Editor-in-Chief">Editor-in-Chief</option>
              <option value="Managing Editor">Managing Editor</option>
              <option value="Associate/Deputy Editor">
                Associate/Deputy Editor
              </option>
              <option value="Section/Handling Editor">
                Section/Handling Editor
              </option>
              <option value="Editorial Board Member">
                Editorial Board Member
              </option>
              <option value="Guest Editor">Guest Editor</option>
              <option value="Series Editor">Series Editor</option>
              <option value="Other">Other</option>
            </select>
          </Field>
          <Field label="Journal Indexing Status">
            {[
              "Scopus",
              "Web of Science",
              "PubMed/MEDLINE",
              "African Journals Online (AJOL)",
              "ERIC",
              "Other recognised index",
              "Not indexed",
            ].map((label) => {
              const checked = Array.isArray(form.indexing_status)
                ? form.indexing_status.includes(label)
                : false;
              return (
                <label
                  key={label}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 transition hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleIndexStatus(label)}
                    className="h-4 w-4 rounded text-blue-600 accent-blue-600"
                  />
                  <span className="text-sm text-slate-700">{label}</span>
                </label>
              );
            })}
          </Field>
        </>
      );
    return (
      <>
        <Field label="Name of Research Group/Cluster" required>
          <input
            name="group_name"
            value={form.group_name || ""}
            onChange={setField}
            className={inputClass}
          />
        </Field>
        <Field label="Type of Research Group/Cluster" required>
          <select
            name="group_type"
            value={form.group_type || ""}
            onChange={setField}
            className={selectClass}
          >
            <option value="">Select type</option>
            <option value="OOU Research Cluster">OOU Research Cluster</option>
            <option value="OOU Research Centre/Institute">
              OOU Research Centre/Institute
            </option>
            <option value="Departmental Research Group">
              Departmental Research Group
            </option>
            <option value="Faculty Research Group">
              Faculty Research Group
            </option>
            <option value="National Research Group/Network">
              National Research Group/Network
            </option>
            <option value="International Research Group/Network">
              International Research Group/Network
            </option>
            <option value="Interdisciplinary Research Group">
              Interdisciplinary Research Group
            </option>
            <option value="Other Research Group">Other Research Group</option>
          </select>
        </Field>
        <Field label="Research Area" required>
          <input
            name="research_area"
            value={form.research_area || ""}
            onChange={setField}
            className={inputClass}
          />
        </Field>
        <Field label="Role" required>
          <select
            name="role"
            value={form.role || ""}
            onChange={setField}
            className={selectClass}
          >
            <option value="">Select role</option>
            <option value="Coordinator/Leader">Coordinator/Leader</option>
            <option value="Co-Coordinator">Co-Coordinator</option>
            <option value="Member">Member</option>
            <option value="Research Associate">Research Associate</option>
            <option value="Other">Other</option>
          </select>
        </Field>
        <Field label="Status" required>
          <select
            name="status"
            value={form.status || ""}
            onChange={setField}
            className={selectClass}
          >
            <option value="">Select status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Newly established">Newly established</option>
            <option value="Under development">Under development</option>
          </select>
        </Field>
        <Field label="Number of Members">
          <input
            type="number"
            name="number_of_members"
            value={form.number_of_members || ""}
            onChange={setField}
            className={inputClass}
          />
        </Field>
      </>
    );
  };

  const renderCards = () => {
    if (data.length === 0)
      return <EmptyState label="No entries yet. Add one above." />;
    if (subTab === "awards")
      return data.map((item) => (
        <CardRow
          key={item.id}
          onEdit={() => openEdit(item)}
          onDelete={() => handleDelete(item.id)}
        >
          <p className="font-semibold text-slate-900">{item.award_name}</p>
          <p className="text-xs text-slate-500">
            {item.awarding_organization} · {item.country} · {item.year_received}
          </p>
          {item.award_category && (
            <p className="text-xs text-slate-400">{item.award_category}</p>
          )}
        </CardRow>
      ));
    if (subTab === "editorial")
      return data.map((item) => (
        <CardRow
          key={item.id}
          onEdit={() => openEdit(item)}
          onDelete={() => handleDelete(item.id)}
        >
          <p className="font-semibold text-slate-900">{item.journal_name}</p>
          <p className="text-xs text-slate-500">
            {item.publisher} · {item.country}
          </p>
          <p className="text-xs text-slate-400">
            {item.position?.replace(/_/g, " ")}
          </p>
          {item.indexing_status?.length > 0 && (
            <p className="text-xs text-slate-400">
              {item.indexing_status.join(", ")}
            </p>
          )}
        </CardRow>
      ));
    return data.map((item) => (
      <CardRow
        key={item.id}
        onEdit={() => openEdit(item)}
        onDelete={() => handleDelete(item.id)}
      >
        <p className="font-semibold text-slate-900">{item.group_name}</p>
        <p className="text-xs text-slate-500">
          {item.group_type?.replace(/_/g, " ")} ·{" "}
          {item.role?.replace(/_/g, " ")}
        </p>
        <p className="text-xs text-slate-400">
          {item.status}{" "}
          {item.number_of_members ? `· ${item.number_of_members} members` : ""}
        </p>
      </CardRow>
    ));
  };

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Research Profile
          </h3>
          <p className="text-sm text-slate-500">
            Manage awards, editorial roles, and research group memberships.
          </p>
        </div>
        <button onClick={openAdd} className={addButtonClass}>
          <AddIcon /> Add New
        </button>
      </div>

      <SubTabs
        tabs={[
          { id: "awards", label: "Awards" },
          { id: "editorial", label: "Editorial Appointments" },
          { id: "groups", label: "Research Groups" },
        ]}
        active={subTab}
        onChange={setSubTab}
      />

      {loading ? (
        <p className="py-4 text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="space-y-3">{renderCards()}</div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Entry" : "Add Entry"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {renderFormFields()}
          {error && (
            <p role="alert" className="text-sm text-rose-600">
              {error}
            </p>
          )}
          <div className="flex gap-2.5 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════════ */
export default function MyAccount() {
  const [tab, setTab] = useState("fellowships");

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <Header />

      <main className="flex-1 w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_8px_32px_-16px_rgba(15,23,42,0.15)]">
            {/* Page header */}
            <div className="border-b border-slate-200 px-5 py-5 sm:px-8 sm:py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                      My Account
                    </h1>
                    <p className="text-sm text-slate-500">
                      Fellowships, appointments, and research profile.
                    </p>
                  </div>
                </div>
                {/* Section switcher — in header on sm+ */}
                <div className="sm:hidden">
                  <SectionSwitcher tab={tab} setTab={setTab} />
                </div>
              </div>
              {/* Section switcher — below title on sm+ */}
              <div className="mt-4 hidden sm:block">
                <SectionSwitcher tab={tab} setTab={setTab} />
              </div>
            </div>

            {/* Content */}
            <div className="px-5 pb-8 sm:px-8">
              {tab === "fellowships" ? (
                <FellowshipSection key="fellowships" />
              ) : (
                <ResearchSection key="research" />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
