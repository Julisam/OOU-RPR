import { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../api";

const labelClass =
  "block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2";
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70";
const selectClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70";

function Modal({ open, onClose, title, children, width = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className={`bg-white rounded-2xl shadow-2xl ${width} w-full mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

function AcademicCapIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  );
}

function BeakerIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  );
}

function SectionSwitcher({ tab, setTab }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 shadow-inner">
      {tab === "fellowships" ? (
        <button
          onClick={() => setTab("fellowships")}
          className={`flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
            tab === "fellowships"
              ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <AcademicCapIcon className="h-5 w-5 text-slate-400" /> Fellowships & Appointments
        </button>
      ) : (
        <button
          onClick={() => setTab("research")}
          className={`flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
            tab === "research"
              ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <BeakerIcon className="h-5 w-5 text-slate-400" /> Research Profile
        </button>
      )}
    </div>
  );
}

function SubTabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-x-7 gap-y-2 border-b border-slate-200">
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`relative pb-3 text-sm font-semibold transition-colors ${
              isActive ? "text-blue-700" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
            <span
              className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full transition-all ${
                isActive ? "bg-blue-600" : "bg-transparent"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

const addButtonClass =
  "inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700";

function AddIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

const fellowshipTabs = [
  { id: "national", label: "National Academies" },
  { id: "international", label: "International Bodies" },
  { id: "visiting", label: "Visiting Professorships" },
];

const researchTabs = [
  { id: "awards", label: "Awards" },
  { id: "editorial", label: "Editorial" },
  { id: "groups", label: "Research Groups" },
];

function FellowshipSection() {
  const [subTab, setSubTab] = useState("national");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const endpoints = { national: "national-academy-fellowships", international: "international-professional-fellowships", visiting: "visiting-professorships" };
  const endpoint = endpoints[subTab];

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

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (editing) {
        await api.put(`${endpoint}/${editing}/`, form);
      } else {
        await api.post(endpoint, form);
      }
      setShowModal(false);
      setEditing(null);
      setForm({});
      fetchData();
    } catch (e) {
      setError(e.response?.data?.detail || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditing(item.id);
    setForm({ ...item });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await api.delete(`${endpoint}/${id}/`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const renderFields = () => {
    if (subTab === "national") {
      return (
        <>
          <div className="mb-4">
            <label className={labelClass}>Academy Name</label>
            <input name="academy_name" value={form.academy_name || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={inputClass} />
          </div>
          <div className="mb-4">
            <label className={labelClass}>Academy Type</label>
            <select name="academy_type" value={form.academy_type || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={selectClass}>
              <option value="national_academy_of_science">National Academy of Science</option>
              <option value="national_academy_of_engineering">National Academy of Engineering</option>
              <option value="national_academy_of_medicine">National Academy of Medicine</option>
              <option value="national_academy_of_education">National Academy of Education</option>
              <option value="national_academy_of_letters_arts">National Academy of Letters/Arts</option>
              <option value="other_national_scholarly_academy">Other recognised national scholarly academy</option>
            </select>
          </div>
          <div className="mb-4">
            <label className={labelClass}>Year Elected</label>
            <input type="number" name="year_elected" value={form.year_elected || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={inputClass} />
          </div>
          <div className="mb-4">
            <label className={labelClass}>Discipline</label>
            <input name="discipline" value={form.discipline || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={inputClass} />
          </div>
        </>
      );
    }
    if (subTab === "international") {
      return (
        <>
          <div className="mb-4">
            <label className={labelClass}>Body Name</label>
            <input name="body_name" value={form.body_name || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={inputClass} />
          </div>
          <div className="mb-4">
            <label className={labelClass}>Country</label>
            <input name="country" value={form.country || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={inputClass} />
          </div>
          <div className="mb-4">
            <label className={labelClass}>Title</label>
            <input name="title" value={form.title || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={inputClass} />
          </div>
          <div className="mb-4">
            <label className={labelClass}>Year Elected</label>
            <input type="number" name="year_elected" value={form.year_elected || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={inputClass} />
          </div>
        </>
      );
    }
    return (
      <>
        <div className="mb-4">
          <label className={labelClass}>Host Institution</label>
          <input name="host_institution" value={form.host_institution || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={inputClass} />
        </div>
        <div className="mb-4">
          <label className={labelClass}>Country</label>
          <input name="country" value={form.country || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={inputClass} />
        </div>
        <div className="mb-4">
          <label className={labelClass}>Title</label>
          <select name="title" value={form.title || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={selectClass}>
            <option value="visiting_professor">Visiting Professor</option>
            <option value="visiting_research_professor">Visiting Research Professor</option>
            <option value="visiting_scholar">Visiting Scholar</option>
          </select>
        </div>
        <div className="mb-4">
          <label className={labelClass}>Year Appointed</label>
          <input type="number" name="year_appointed" value={form.year_appointed || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={inputClass} />
        </div>
        <div className="mb-4">
          <label className={labelClass}>Duration</label>
          <input name="duration" value={form.duration || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={inputClass} />
        </div>
      </>
    );
  };

  const renderTable = () => {
    if (subTab === "national") {
      return data.map((item, i) => (
        <tr key={item.id} className="border-t border-slate-200">
          <td className="px-4 py-3 text-slate-600">{i + 1}</td>
          <td className="px-4 py-3 text-slate-900">{item.academy_name}</td>
          <td className="px-4 py-3 text-slate-600">{item.academy_type?.replace(/_/g, ' ')}</td>
          <td className="px-4 py-3 text-slate-600">{item.year_elected}</td>
          <td className="px-4 py-3 text-slate-600">{item.discipline}</td>
          <td className="px-4 py-3">
            <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 text-sm mr-3">Edit</button>
            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
          </td>
        </tr>
      ));
    }
    if (subTab === "international") {
      return data.map((item, i) => (
        <tr key={item.id} className="border-t border-slate-200">
          <td className="px-4 py-3 text-slate-600">{i + 1}</td>
          <td className="px-4 py-3 text-slate-900">{item.body_name}</td>
          <td className="px-4 py-3 text-slate-600">{item.country}</td>
          <td className="px-4 py-3 text-slate-600">{item.title}</td>
          <td className="px-4 py-3 text-slate-600">{item.year_elected}</td>
          <td className="px-4 py-3">
            <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 text-sm mr-3">Edit</button>
            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
          </td>
        </tr>
      ));
    }
    return data.map((item, i) => (
      <tr key={item.id} className="border-t border-slate-200">
        <td className="px-4 py-3 text-slate-600">{i + 1}</td>
        <td className="px-4 py-3 text-slate-900">{item.host_institution}</td>
        <td className="px-4 py-3 text-slate-600">{item.country}</td>
        <td className="px-4 py-3 text-slate-600">{item.title?.replace(/_/g, ' ')}</td>
        <td className="px-4 py-3 text-slate-600">{item.year_appointed}</td>
        <td className="px-4 py-3 text-slate-600">{item.duration}</td>
        <td className="px-4 py-3">
          <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 text-sm mr-3">Edit</button>
          <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {subTab === "national" ? "National Academy Fellowships" : subTab === "international" ? "International Professional Fellowships" : "Visiting Professorships"}
          </h3>
          <p className="text-sm text-slate-500 mt-1">Manage your fellowships and appointments.</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({}); setShowModal(true); }} className={addButtonClass}>
          <AddIcon /> Add New
        </button>
      </div>
      <SubTabs tabs={fellowshipTabs} active={subTab} onChange={setSubTab} />
      {loading ? <div className="text-sm text-slate-500">Loading...</div> : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">S/N</th>
                {subTab === "national" ? <th className="px-4 py-3">Academy</th> : null}
                {subTab === "national" ? <th className="px-4 py-3">Type</th> : null}
                {subTab === "international" ? <th className="px-4 py-3">Body</th> : null}
                {subTab === "international" ? <th className="px-4 py-3">Country</th> : null}
                {subTab === "visiting" ? <th className="px-4 py-3">Institution</th> : null}
                {subTab === "visiting" ? <th className="px-4 py-3">Country</th> : null}
                {subTab === "visiting" ? <th className="px-4 py-3">Title</th> : null}
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={10} className="px-4 py-4 text-slate-500">No entries yet.</td></tr>}
              {renderTable()}
            </tbody>
          </table>
        </div>
      )}
      <button onClick={() => { setEditing(null); setForm({}); setShowModal(true); }} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">Add New</button>
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Entry" : "Add Entry"}>
        <form onSubmit={handleSave} className="space-y-2">
          {renderFields()}
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold">{submitting ? "Saving..." : "Save"}</button>
            <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function ResearchSection() {
  const [subTab, setSubTab] = useState("awards");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [indexStatuses, setIndexStatuses] = useState([]);

  const endpoints = { awards: "research-awards", editorial: "editorial-appointments", groups: "research-group-memberships" };
  const endpoint = endpoints[subTab];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get(endpoint);
      setData(res);
      if (subTab === "editorial") {
        const { data: statuses } = await api.get("journal-index-statuses/");
        setIndexStatuses(statuses);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [endpoint, subTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = { ...form };
      if (subTab === "editorial" && payload.indexing_status) {
        payload.indexing_status = payload.indexing_status.map(Number);
      } else {
        delete payload.indexing_status;
      }
      if (editing) {
        await api.put(`${endpoint}/${editing}/`, payload);
      } else {
        await api.post(endpoint, payload);
      }
      setShowModal(false);
      setEditing(null);
      setForm({});
      fetchData();
    } catch (e) {
      setError(e.response?.data?.detail || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditing(item.id);
    setForm({ ...item, indexing_status: item.indexing_status?.map((s) => s.id) || [] });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await api.delete(`${endpoint}/${id}/`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const renderFields = () => {
    if (subTab === "awards") {
      return (
        <>
          <div className="mb-4"><label className={labelClass}>Award Name</label><input name="award_name" value={form.award_name || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={inputClass} /></div>
          <div className="mb-4"><label className={labelClass}>Organization</label><input name="awarding_organization" value={form.awarding_organization || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={inputClass} /></div>
          <div className="mb-4"><label className={labelClass}>Country</label><input name="country" value={form.country || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={inputClass} /></div>
          <div className="mb-4"><label className={labelClass}>Year Received</label><input type="number" name="year_received" value={form.year_received || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={inputClass} /></div>
          <div className="mb-4"><label className={labelClass}>Category</label><input name="award_category" value={form.award_category || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={inputClass} /></div>
        </>
      );
    }
    if (subTab === "editorial") {
      return (
        <>
          <div className="mb-4"><label className={labelClass}>Journal Name</label><input name="journal_name" value={form.journal_name || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={inputClass} /></div>
          <div className="mb-4"><label className={labelClass}>Publisher</label><input name="publisher" value={form.publisher || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={inputClass} /></div>
          <div className="mb-4"><label className={labelClass}>Country</label><input name="country" value={form.country || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={inputClass} /></div>
          <div className="mb-4"><label className={labelClass}>Position</label><select name="position" value={form.position || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={selectClass}>
            <option value="editor_in_chief">Editor-in-Chief</option><option value="managing_editor">Managing Editor</option><option value="associate_deputy_editor">Associate/Deputy Editor</option><option value="section_handling_editor">Section/Handling Editor</option><option value="editorial_board_member">Editorial Board Member</option><option value="guest_editor">Guest Editor</option><option value="series_editor">Series Editor</option><option value="other_editor">Other</option>
          </select></div>
          <div className="mb-4"><label className={labelClass}>Indexing Status</label><div className="space-y-2">{indexStatuses.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={(form.indexing_status || []).includes(s.id)} onChange={(e) => { const ids = e.target.checked ? [...(form.indexing_status || []), s.id] : (form.indexing_status || []).filter((x) => x !== s.id); setForm({ ...form, indexing_status: ids }); }} className="rounded" /><span>{s.name}</span></label>
          ))}</div></div>
        </>
      );
    }
    return (
      <>
        <div className="mb-4"><label className={labelClass}>Group Name</label><input name="group_name" value={form.group_name || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={inputClass} /></div>
        <div className="mb-4"><label className={labelClass}>Group Type</label><select name="group_type" value={form.group_type || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={selectClass}>
          <option value="oou_research_cluster">OOU Research Cluster</option><option value="oou_research_centre">OOU Research Centre/Institute</option><option value="departmental_research_group">Departmental Research Group</option><option value="faculty_research_group">Faculty Research Group</option><option value="national_research_group">National Research Group/Network</option><option value="international_research_group">International Research Group/Network</option><option value="interdisciplinary_research_group">Interdisciplinary Research Group</option><option value="other_research_group">Other</option>
        </select></div>
        <div className="mb-4"><label className={labelClass}>Research Area</label><input name="research_area" value={form.research_area || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={inputClass} /></div>
        <div className="mb-4"><label className={labelClass}>Role</label><select name="role" value={form.role || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={selectClass}>
          <option value="coordinator">Coordinator/Leader</option><option value="co_coordinator">Co-Coordinator</option><option value="member">Member</option><option value="research_associate">Research Associate</option><option value="other_role">Other</option>
        </select></div>
        <div className="mb-4"><label className={labelClass}>Status</label><select name="status" value={form.status || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={selectClass}>
          <option value="active">Active</option><option value="inactive">Inactive</option><option value="newly_established">Newly established</option><option value="under_development">Under development</option>
        </select></div>
        <div className="mb-4"><label className={labelClass}>Number of Members</label><input type="number" name="number_of_members" value={form.number_of_members || ""} onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })} className={inputClass} /></div>
      </>
    );
  };

  const renderTable = () => {
    if (subTab === "awards") {
      return data.map((item, i) => (
        <tr key={item.id} className="border-t border-slate-200">
          <td className="px-4 py-3 text-slate-600">{i + 1}</td>
          <td className="px-4 py-3 text-slate-900">{item.award_name}</td>
          <td className="px-4 py-3 text-slate-600">{item.awarding_organization}</td>
          <td className="px-4 py-3 text-slate-600">{item.country}</td>
          <td className="px-4 py-3 text-slate-600">{item.year_received}</td>
          <td className="px-4 py-3 text-slate-600">{item.award_category}</td>
          <td className="px-4 py-3"><button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 text-sm mr-3">Edit</button><button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button></td>
        </tr>
      ));
    }
    if (subTab === "editorial") {
      return data.map((item, i) => (
        <tr key={item.id} className="border-t border-slate-200">
          <td className="px-4 py-3 text-slate-600">{i + 1}</td>
          <td className="px-4 py-3 text-slate-900">{item.journal_name}</td>
          <td className="px-4 py-3 text-slate-600">{item.publisher}</td>
          <td className="px-4 py-3 text-slate-600">{item.country}</td>
          <td className="px-4 py-3 text-slate-600">{item.position?.replace(/_/g, ' ')}</td>
          <td className="px-4 py-3 text-slate-600">{item.indexing_status?.map((s) => s.name).join(', ') || '—'}</td>
          <td className="px-4 py-3"><button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 text-sm mr-3">Edit</button><button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button></td>
        </tr>
      ));
    }
    return data.map((item, i) => (
      <tr key={item.id} className="border-t border-slate-200">
        <td className="px-4 py-3 text-slate-600">{i + 1}</td>
        <td className="px-4 py-3 text-slate-900">{item.group_name}</td>
        <td className="px-4 py-3 text-slate-600">{item.group_type?.replace(/_/g, ' ')}</td>
        <td className="px-4 py-3 text-slate-600">{item.research_area}</td>
        <td className="px-4 py-3 text-slate-600">{item.role?.replace(/_/g, ' ')}</td>
        <td className="px-4 py-3 text-slate-600">{item.status}</td>
        <td className="px-4 py-3 text-slate-600">{item.number_of_members}</td>
        <td className="px-4 py-3"><button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 text-sm mr-3">Edit</button><button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button></td>
      </tr>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Research Profile</h3>
          <p className="text-sm text-slate-500 mt-1">Manage your awards, editorial roles, and group memberships.</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({}); setShowModal(true); }} className={addButtonClass}>
          <AddIcon /> Add New
        </button>
      </div>
      <SubTabs tabs={researchTabs} active={subTab} onChange={setSubTab} />
      {loading ? <div className="text-sm text-slate-500">Loading...</div> : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">S/N</th>
                {subTab === "awards" ? <th className="px-4 py-3">Award</th> : null}
                {subTab === "awards" ? <th className="px-4 py-3">Organization</th> : null}
                {subTab === "editorial" ? <th className="px-4 py-3">Journal</th> : null}
                {subTab === "editorial" ? <th className="px-4 py-3">Publisher</th> : null}
                {subTab === "groups" ? <th className="px-4 py-3">Group</th> : null}
                {subTab === "groups" ? <th className="px-4 py-3">Role</th> : null}
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={10} className="px-4 py-4 text-slate-500">No entries yet.</td></tr>}
              {renderTable()}
            </tbody>
          </table>
        </div>
      )}
      <button onClick={() => { setEditing(null); setForm({}); setShowModal(true); }} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">Add New</button>
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Entry" : "Add Entry"}>
        <form onSubmit={handleSave} className="space-y-2">
          {renderFields()}
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold">{submitting ? "Saving..." : "Save"}</button>
            <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function MyAccount() {
  const [tab, setTab] = useState("fellowships");
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex flex-col">
      <Header />
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] h-full min-h-[calc(100vh-12rem)] flex flex-col">
            <div className="px-8 py-8 border-b border-slate-200/50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">My Account</h1>
                  <p className="text-slate-600 mt-1">Manage your fellowships, appointments, and research profile.</p>
                </div>
              </div>
            </div>
            <div className="flex-1 p-8">
              <SectionSwitcher tab={tab} setTab={setTab} />
              {tab === "fellowships" ? <FellowshipSection /> : <ResearchSection />}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
