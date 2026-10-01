import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    profession: "",
    specialization: "",
    organization: "",
    preferredLanguage: "English",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/api/profile");

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load profile.");
      }

      setUser(data.user);

      setFormData({
        fullName: data.user.fullName || "",
        profession: data.user.profession || "",
        specialization: data.user.specialization || "",
        organization: data.user.organization || "",
        preferredLanguage: data.user.preferredLanguage || "English",
      });
    } catch (err) {
      console.error("Profile loading error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEdit = () => {
    setSuccess("");
    setError("");
    setEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      fullName: user.fullName || "",
      profession: user.profession || "",
      specialization: user.specialization || "",
      organization: user.organization || "",
      preferredLanguage: user.preferredLanguage || "English",
    });

    setError("");
    setSuccess("");
    setEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await apiFetch("/api/profile", {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      setUser(data.user);

      setFormData({
        fullName: data.user.fullName || "",
        profession: data.user.profession || "",
        specialization: data.user.specialization || "",
        organization: data.user.organization || "",
        preferredLanguage: data.user.preferredLanguage || "English",
      });

      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">Loading your profile...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="profile-page">
        <div className="profile-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div className="profile-header-info">
          <h1>{user?.fullName}</h1>
          <p>{user?.profession}</p>
        </div>

        {!editing && (
          <button className="profile-edit-button" onClick={handleEdit}>
            Edit Profile
          </button>
        )}
      </div>

      {success && <div className="profile-success">{success}</div>}

      {error && user && <div className="profile-error">{error}</div>}

      {editing ? (
        <form className="profile-card" onSubmit={handleSave}>
          <div className="profile-card-title">
            <h2>Edit Profile</h2>
            <p>Update your professional information.</p>
          </div>

          <div className="profile-form-grid">
            <div className="profile-field">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="profile-field">
              <label>Email</label>
              <input type="email" value={user.email} disabled />
              <small>Email cannot be changed here.</small>
            </div>

            <div className="profile-field">
              <label>Profession</label>
              <input
                type="text"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                required
              />
            </div>

            <div className="profile-field">
              <label>Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g. Emergency Care"
              />
            </div>

            <div className="profile-field">
              <label>Organization</label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="e.g. Hospital or Organization"
              />
            </div>

            <div className="profile-field">
              <label>Preferred Language</label>
              <select
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleChange}
              >
                <option value="English">English</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Hindi">Hindi</option>
                <option value="Tamil">Tamil</option>
                <option value="Kannada">Kannada</option>
                <option value="Telugu">Telugu</option>
              </select>
            </div>
          </div>

          <div className="profile-form-actions">
            <button
              type="button"
              className="profile-cancel-button"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="profile-save-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-card">
          <div className="profile-card-title">
            <h2>Account Information</h2>
            <p>Your professional profile information.</p>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span className="profile-info-label">Full Name</span>
              <span className="profile-info-value">
                {user?.fullName || "Not provided"}
              </span>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-label">Email</span>
              <span className="profile-info-value">
                {user?.email || "Not provided"}
              </span>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-label">Profession</span>
              <span className="profile-info-value">
                {user?.profession || "Not provided"}
              </span>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-label">Specialization</span>
              <span className="profile-info-value">
                {user?.specialization || "Not provided"}
              </span>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-label">Organization</span>
              <span className="profile-info-value">
                {user?.organization || "Not provided"}
              </span>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-label">Preferred Language</span>
              <span className="profile-info-value">
                {user?.preferredLanguage || "English"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
