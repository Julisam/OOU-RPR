import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../api";

function ChangePassword() {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    if (
      !formData.current_password ||
      !formData.new_password ||
      !formData.confirm_password
    ) {
      setError("All password fields are required.");
      setSubmitting(false);
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError("New passwords do not match.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await api.post("change-password/", formData);
      setSuccess(response.data?.detail || "Password updated successfully.");
      setFormData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        "Unable to update password. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-slate-900">
                Change Password
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Update your account password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleChange}
                  className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  placeholder="Re-enter new password"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {success}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ChangePassword;
