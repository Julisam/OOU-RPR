import { useState, useEffect } from "react";
import api from "../api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { states } from "../data/states";

/* ─── Helpers ────────────────────────────────────────────────────── */
const inputClass =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 " +
  "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70 sm:text-sm";

const selectClass =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 " +
  "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70 sm:text-sm";

const fieldLabelClass = "block text-sm font-semibold text-slate-700";

const displayClass =
  "mt-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3";

/* ─── Field component (view/edit mode) ──────────────────────────── */
function ProfileField({ label, name, type = "text", value, editing, onChange, placeholder, colSpan = "" }) {
  return (
    <div className={colSpan}>
      <label htmlFor={name} className={fieldLabelClass}>
        {label}
      </label>
      {editing ? (
        <input
          id={name}
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          className={inputClass}
          autoComplete="off"
        />
      ) : (
        <div className={displayClass}>
          <p className="text-sm font-medium text-slate-900">{value || <span className="text-slate-400">Not provided</span>}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Data-loading helpers ───────────────────────────────────────── */
const loadProfile = async (setUserInfo, setFormData, setLoading, isActive) => {
  try {
    const { data } = await api.get("profile/");
    if (!isActive()) return;
    setUserInfo(data);
    setFormData(data);
  } catch (err) {
    if (isActive()) console.error("Error fetching profile:", err);
  } finally {
    if (isActive()) setLoading(false);
  }
};

const loadDepartments = async (setDepartments, isActive) => {
  try {
    const { data } = await api.get("departments/");
    if (!isActive()) return;
    setDepartments(data.sort((a, b) => a.name.localeCompare(b.name)));
  } catch (err) {
    if (isActive()) console.error("Error fetching departments:", err);
  }
};

/* ═══════════════════════════════════════════════════════════════════ */
function Profile() {
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [formData, setFormData] = useState({});
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    let active = true;
    loadProfile(setUserInfo, setFormData, setLoading, () => active);
    loadDepartments(setDepartments, () => active);
    return () => { active = false; };
  }, []);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCancel = () => {
    setFormData(userInfo);
    setEditing(false);
    setSaveError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const { data } = await api.put("profile/", formData);
      setUserInfo(data);
      setEditing(false);
    } catch (err) {
      setSaveError(err?.response?.data?.detail || "Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh flex-col bg-slate-50">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <p className="text-sm text-slate-500">Loading profile…</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <Header />

      <main className="flex-1 w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_8px_32px_-16px_rgba(15,23,42,0.15)]">

            {/* ── Page header ────────────────────────────────────── */}
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Profile</h1>
                  <p className="text-sm text-slate-500">Manage your academic profile</p>
                </div>
              </div>

              {/* Action buttons — always visible at top */}
              <div className="flex gap-2.5">
                {editing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-[0.98]"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* ── Save error ─────────────────────────────────────── */}
            {saveError && (
              <div className="mx-5 mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 sm:mx-8">
                {saveError}
              </div>
            )}

            {/* ── Form grid ──────────────────────────────────────── */}
            <div className="px-5 py-6 sm:px-8 sm:py-8">
              {/* Section: Personal Info */}
              <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Personal Information
              </h2>
              {/* 1 col → 2 col (sm) → 3 col (lg) */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <ProfileField label="Title" name="title" value={formData.title} editing={editing} onChange={handleChange} placeholder="Dr., Prof., etc." />
                <ProfileField label="Surname" name="sname" value={formData.sname} editing={editing} onChange={handleChange} placeholder="Enter surname" />
                <ProfileField label="First Name" name="fname" value={formData.fname} editing={editing} onChange={handleChange} placeholder="Enter first name" />
                <ProfileField label="Middle Name" name="mname" value={formData.mname} editing={editing} onChange={handleChange} placeholder="Optional" />

                {/* Academic Rank — custom select */}
                <div>
                  <label htmlFor="academic_rank" className={fieldLabelClass}>Academic Rank</label>
                  {editing ? (
                    <select
                      id="academic_rank"
                      name="academic_rank"
                      value={formData.academic_rank || ""}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      <option value="">Select rank</option>
                      <option value="professor">Professor</option>
                      <option value="associate_professor">Associate Professor</option>
                      <option value="senior_lecturer">Senior Lecturer</option>
                      <option value="lecturer_i">Lecturer I</option>
                      <option value="lecturer_ii">Lecturer II</option>
                      <option value="assistant_lecturer">Assistant Lecturer</option>
                      <option value="graduate_assistant">Graduate Assistant</option>
                    </select>
                  ) : (
                    <div className={displayClass}>
                      <p className="text-sm font-medium text-slate-900">
                        {userInfo.academic_rank
                          ? userInfo.academic_rank.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
                          : <span className="text-slate-400">Not provided</span>
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Department — custom select */}
                <div>
                  <label htmlFor="department" className={fieldLabelClass}>Department</label>
                  {editing ? (
                    <select
                      id="department"
                      name="department"
                      value={formData.department || ""}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      <option value="">Select department</option>
                      {departments.map((dept) => (
                        <option key={dept.code} value={dept.code}>{dept.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className={displayClass}>
                      <p className="text-sm font-medium text-slate-900">
                        {userInfo.department_name || <span className="text-slate-400">Not provided</span>}
                      </p>
                      {userInfo.faculty_name && (
                        <p className="mt-0.5 text-xs text-slate-500">{userInfo.faculty_name}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Contact */}
              <h2 className="mb-4 mt-8 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Contact &amp; Location
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <ProfileField label="Personal Email" name="email" type="email" value={formData.email} editing={editing} onChange={handleChange} placeholder="personal@email.com" />
                <ProfileField label="Official Email" name="officialemail" type="email" value={formData.officialemail} editing={editing} onChange={handleChange} placeholder="staff@oouagoiwoye.edu.ng" />
                <ProfileField label="Phone Number" name="phone_number" type="tel" value={formData.phone_number} editing={editing} onChange={handleChange} placeholder="+234 800 000 0000" />

                {/* State of origin */}
                <div>
                  <label htmlFor="state_of_origin" className={fieldLabelClass}>State of Origin</label>
                  {editing ? (
                    <select
                      id="state_of_origin"
                      name="state_of_origin"
                      value={formData.state_of_origin || ""}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      <option value="">Select state</option>
                      {states.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  ) : (
                    <div className={displayClass}>
                      <p className="text-sm font-medium text-slate-900">
                        {userInfo.state_of_origin || <span className="text-slate-400">Not provided</span>}
                      </p>
                    </div>
                  )}
                </div>

                <ProfileField label="Specialization" name="specialization" value={formData.specialization} editing={editing} onChange={handleChange} placeholder="e.g. Machine Learning" />
              </div>

              {/* Section: Research IDs */}
              <h2 className="mb-4 mt-8 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Research Identifiers
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <ProfileField label="ORCID ID" name="orcid_id" value={formData.orcid_id} editing={editing} onChange={handleChange} placeholder="0000-0000-0000-0000" />
                <ProfileField label="Scopus ID" name="scopus_id" value={formData.scopus_id} editing={editing} onChange={handleChange} placeholder="Enter Scopus ID" />
                <ProfileField label="Google Scholar ID" name="google_scholar_id" value={formData.google_scholar_id} editing={editing} onChange={handleChange} placeholder="Enter Scholar ID" />
              </div>

              {/* Bottom actions (duplicate for long forms on desktop) */}
              {editing && (
                <div className="mt-8 flex gap-2.5">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Profile;
