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

    if (!formData.current_password || !formData.new_password || !formData.confirm_password) {
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
      setFormData({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to update password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 " +
    "placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200/70 sm:text-sm";

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <Header />

      <main className="flex-1 w-full px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-lg">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_32px_-16px_rgba(15,23,42,0.15)] sm:p-8">

            {/* Page title */}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Change Password</h1>
              <p className="mt-1 text-sm text-slate-500">Update your account password.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="current_password" className="block text-sm font-semibold text-slate-700">
                  Current Password
                </label>
                <input
                  id="current_password"
                  type="password"
                  name="current_password"
                  autoComplete="current-password"
                  value={formData.current_password}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label htmlFor="new_password" className="block text-sm font-semibold text-slate-700">
                  New Password
                </label>
                <input
                  id="new_password"
                  type="password"
                  name="new_password"
                  autoComplete="new-password"
                  value={formData.new_password}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-semibold text-slate-700">
                  Confirm New Password
                </label>
                <input
                  id="confirm_password"
                  type="password"
                  name="confirm_password"
                  autoComplete="new-password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Re-enter new password"
                />
              </div>

              {error && (
                <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {error}
                </div>
              )}

              {success && (
                <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Updating…" : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ChangePassword;
