import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import "./ResourceManagement.css";

const categories = [
  "Stress Management",
  "Mental Wellbeing",
  "Sleep & Recovery",
  "Emotional Wellbeing",
  "Self-Care",
  "Workplace Wellbeing",
  "Mindfulness",
  "Journaling",
];

const resourceTypes = [
  "Article",
  "Guide",
  "Video",
  "Exercise",
  "External Resource",
];

const emptyForm = {
  title: "",
  description: "",
  category: "Stress Management",
  resourceType: "Guide",
  content: "",
  externalUrl: "",
  source: "",
};

function ResourceManagement() {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources() {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/api/resources");

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load resources.");
      }

      setResources(data.resources || []);
    } catch (error) {
      console.error("Resource management loading error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(resource) {
    setEditingId(resource._id);

    setForm({
      title: resource.title || "",
      description: resource.description || "",
      category: resource.category || "Stress Management",
      resourceType: resource.resourceType || "Guide",
      content: resource.content || "",
      externalUrl: resource.externalUrl || "",
      source: resource.source || "",
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const endpoint = editingId
        ? `/api/resources/${editingId}`
        : "/api/resources";

      const method = editingId ? "PATCH" : "POST";

      const response = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(form),
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save resource.");
      }

      setMessage(
        editingId
          ? "Resource updated successfully."
          : "Resource added successfully.",
      );

      resetForm();
      await loadResources();
    } catch (error) {
      console.error("Save resource error:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(resourceId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resource?",
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await apiFetch(`/api/resources/${resourceId}`, {
        method: "DELETE",
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete resource.");
      }

      setMessage("Resource deleted successfully.");

      if (editingId === resourceId) {
        resetForm();
      }

      await loadResources();
    } catch (error) {
      console.error("Delete resource error:", error);
      setError(error.message);
    }
  }

  return (
    <div className="resource-management-page">
      <div className="resource-management-header">
        <p className="resource-management-eyebrow">
          SUKOON RESOURCE MANAGEMENT
        </p>

        <h1>Manage Resources</h1>

        <p>
          Add, update, or remove wellbeing resources available through the
          Resource Hub.
        </p>
      </div>

      {message && <div className="resource-management-message">{message}</div>}

      {error && <div className="resource-management-error">{error}</div>}

      <section className="resource-form-card">
        <div className="resource-form-header">
          <div>
            <h2>{editingId ? "Edit Resource" : "Add New Resource"}</h2>

            <p>
              {editingId
                ? "Update the selected resource."
                : "Create a new resource for the Resource Hub."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="resource-form-grid">
            <div className="resource-form-field full">
              <label>Title *</label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter resource title"
                required
              />
            </div>

            <div className="resource-form-field full">
              <label>Description *</label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Short description of the resource"
                rows="3"
                required
              />
            </div>

            <div className="resource-form-field">
              <label>Category *</label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="resource-form-field">
              <label>Resource Type *</label>

              <select
                name="resourceType"
                value={form.resourceType}
                onChange={handleChange}
                required
              >
                {resourceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="resource-form-field full">
              <label>Content</label>

              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Enter the resource content or guidance"
                rows="7"
              />
            </div>

            <div className="resource-form-field">
              <label>Source</label>

              <input
                name="source"
                value={form.source}
                onChange={handleChange}
                placeholder="e.g. Sukoon"
              />
            </div>

            <div className="resource-form-field">
              <label>External URL</label>

              <input
                type="url"
                name="externalUrl"
                value={form.externalUrl}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="resource-form-actions">
            <button
              type="submit"
              className="resource-save-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Resource"
                  : "Add Resource"}
            </button>

            {editingId && (
              <button
                type="button"
                className="resource-cancel-button"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="resource-management-list">
        <div className="resource-list-header">
          <h2>Existing Resources</h2>

          <span>
            {resources.length}{" "}
            {resources.length === 1 ? "resource" : "resources"}
          </span>
        </div>

        {loading ? (
          <div className="resource-management-state">Loading resources...</div>
        ) : resources.length === 0 ? (
          <div className="resource-management-state">No resources found.</div>
        ) : (
          <div className="resource-management-table">
            {resources.map((resource) => (
              <div className="resource-management-row" key={resource._id}>
                <div className="resource-management-info">
                  <h3>{resource.title}</h3>

                  <p>{resource.description}</p>

                  <div className="resource-management-meta">
                    <span>{resource.category}</span>

                    <span>{resource.resourceType}</span>
                  </div>
                </div>

                <div className="resource-management-actions">
                  <button
                    className="resource-edit-button"
                    onClick={() => startEdit(resource)}
                  >
                    Edit
                  </button>

                  <button
                    className="resource-delete-button"
                    onClick={() => handleDelete(resource._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ResourceManagement;
