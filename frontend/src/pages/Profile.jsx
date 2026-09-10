import { useState, useEffect } from "react";
import api from "../api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { states } from "../data/states";

const fetchProfile = async (setUserInfo, setFormData, setLoading, isActive) => {
  try {
    const response = await api.get("profile/");
    if (!isActive()) return;
    setUserInfo(response.data);
    setFormData(response.data);
  } catch (error) {
    if (isActive()) console.error("Error fetching profile:", error);
  } finally {
    if (isActive()) setLoading(false);
  }
};

const fetchDepartments = async (setDepartments, isActive) => {
  try {
    const response = await api.get("departments/");
    if (!isActive()) return;
    setDepartments(response.data.sort((a, b) => a.name.localeCompare(b.name)));
  } catch (error) {
    if (isActive()) console.error("Error fetching departments:", error);
  }
};

function Profile() {
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [departments, setDepartments] = useState([]);

  const handleEdit = () => {
    setEditing(true);
  };

  useEffect(() => {
    let active = true;

    fetchProfile(setUserInfo, setFormData, setLoading, () => active);
    fetchDepartments(setDepartments, () => active);

    return () => {
      active = false;
    };
  }, []);

  const handleCancel = () => {
    setFormData(userInfo);
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      const response = await api.put("profile/", formData);
      setUserInfo(response.data);
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex flex-col">
      <Header />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto h-full">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] h-full min-h-[calc(100vh-12rem)] flex flex-col">
            <div className="px-8 py-8 border-b border-slate-200/50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
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
                  <h1 className="text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Profile
                  </h1>
                  <p className="text-slate-600 mt-1">
                    Manage your academic profile information
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-8">
              <div className="mb-8 flex flex-wrap gap-4">
                {editing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-8 py-4 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-semibold hover:bg-slate-200 transform hover:scale-105 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="px-8 py-4 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Title
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="title"
                      value={formData.title || ""}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white/50 px-6 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="Dr., Prof., etc."
                    />
                  ) : (
                    <div className="bg-slate-50/50 rounded-2xl px-6 py-4 border border-slate-200">
                      <p className="text-slate-900 font-medium">
                        {userInfo.title || "Not provided"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Surname
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="sname"
                      value={formData.sname || ""}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white/50 px-6 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your surname"
                    />
                  ) : (
                    <div className="bg-slate-50/50 rounded-2xl px-6 py-4 border border-slate-200">
                      <p className="text-slate-900 font-medium">
                        {userInfo.sname || "Not provided"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    First Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="fname"
                      value={formData.fname || ""}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white/50 px-6 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your first name"
                    />
                  ) : (
                    <div className="bg-slate-50/50 rounded-2xl px-6 py-4 border border-slate-200">
                      <p className="text-slate-900 font-medium">
                        {userInfo.fname || "Not provided"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Middle Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="mname"
                      value={formData.mname || ""}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white/50 px-6 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your middle name (optional)"
                    />
                  ) : (
                    <div className="bg-slate-50/50 rounded-2xl px-6 py-4 border border-slate-200">
                      <p className="text-slate-900 font-medium">
                        {userInfo.mname || "Not provided"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Academic Rank
                  </label>
                  {editing ? (
                    <select
                      name="academic_rank"
                      value={formData.academic_rank || ""}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white/50 px-6 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Select academic rank</option>
                      <option value="professor">Professor</option>
                      <option value="associate_professor">
                        Associate Professor
                      </option>
                      <option value="senior_lecturer">Senior Lecturer</option>
                      <option value="lecturer_i">Lecturer I</option>
                      <option value="lecturer_ii">Lecturer II</option>
                      <option value="assistant_lecturer">
                        Assistant Lecturer
                      </option>
                      <option value="graduate_assistant">
                        Graduate Assistant
                      </option>
                    </select>
                  ) : (
                    <div className="bg-slate-50/50 rounded-2xl px-6 py-4 border border-slate-200">
                      <p className="text-slate-900 font-medium">
                        {userInfo.academic_rank
                          ?.replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase()) ||
                          "Not provided"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="group md:col-span-2 xl:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Department
                  </label>
                  {editing ? (
                    <select
                      name="department"
                      value={formData.department || ""}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white/50 px-6 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Select department</option>
                      {departments.map((dept) => (
                        <option key={dept.code} value={dept.code}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="bg-slate-50/50 rounded-2xl px-6 py-4 border border-slate-200">
                      <p className="text-slate-900 font-medium">
                        {userInfo.department_name || "Not provided"}
                      </p>
                      {userInfo.faculty_name && (
                        <p className="text-xs text-slate-500 mt-1">
                          {userInfo.faculty_name}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Personal Email
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white/50 px-6 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your personal email"
                    />
                  ) : (
                    <div className="bg-slate-50/50 rounded-2xl px-6 py-4 border border-slate-200">
                      <p className="text-slate-900 font-medium">
                        {userInfo.email || "Not provided"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Official Email
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      name="officialemail"
                      value={formData.officialemail || ""}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white/50 px-6 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your official email"
                    />
                  ) : (
                    <div className="bg-slate-50/50 rounded-2xl px-6 py-4 border border-slate-200">
                      <p className="text-slate-900 font-medium">
                        {userInfo.officialemail || "Not provided"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Phone Number
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number || ""}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white/50 px-6 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="bg-slate-50/50 rounded-2xl px-6 py-4 border border-slate-200">
                      <p className="text-slate-900 font-medium">
                        {userInfo.phone_number || "Not provided"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="group md:col-span-2 xl:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Specialization
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization || ""}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white/50 px-6 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your specialization"
                    />
                  ) : (
                    <div className="bg-slate-50/50 rounded-2xl px-6 py-4 border border-slate-200">
                      <p className="text-slate-900 font-medium">
                        {userInfo.specialization || "Not provided"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    State of Origin
                  </label>
                  {editing ? (
                    <select
                      name="state_of_origin"
                      value={formData.state_of_origin || ""}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white/50 px-6 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Select state of origin</option>
                      {states.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="bg-slate-50/50 rounded-2xl px-6 py-4 border border-slate-200">
                      <p className="text-slate-900 font-medium">
                        {userInfo.state_of_origin || "Not provided"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    ORCID ID
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="orcid_id"
                      value={formData.orcid_id || ""}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white/50 px-6 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="0000-0000-0000-0000"
                    />
                  ) : (
                    <div className="bg-slate-50/50 rounded-2xl px-6 py-4 border border-slate-200">
                      <p className="text-slate-900 font-medium">
                        {userInfo.orcid_id || "Not provided"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Scopus ID
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="scopus_id"
                      value={formData.scopus_id || ""}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white/50 px-6 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your Scopus ID"
                    />
                  ) : (
                    <div className="bg-slate-50/50 rounded-2xl px-6 py-4 border border-slate-200">
                      <p className="text-slate-900 font-medium">
                        {userInfo.scopus_id || "Not provided"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Google Scholar ID (with OOU affiliation)
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="google_scholar_id"
                      value={formData.google_scholar_id || ""}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white/50 px-6 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your Google Scholar ID"
                    />
                  ) : (
                    <div className="bg-slate-50/50 rounded-2xl px-6 py-4 border border-slate-200">
                      <p className="text-slate-900 font-medium">
                        {userInfo.google_scholar_id || "Not provided"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-12 flex flex-wrap gap-4">
                {editing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-8 py-4 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-semibold hover:bg-slate-200 transform hover:scale-105 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="px-8 py-4 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Profile;
