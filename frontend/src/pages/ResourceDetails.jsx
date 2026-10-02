import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../utils/api";
import "./ResourceDetails.css";

function ResourceDetails() {
  const { resourceId } = useParams();
  const navigate = useNavigate();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadResource();
  }, [resourceId]);

  async function loadResource() {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(`/api/resources/${resourceId}`);

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load resource.");
      }

      setResource(data.resource);
    } catch (error) {
      console.error("Resource details error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="resource-details-page">
        <div className="resource-details-state">Loading resource...</div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="resource-details-page">
        <button
          className="resource-back-button"
          onClick={() => navigate("/resources")}
        >
          ← Back to Resource Hub
        </button>

        <div className="resource-details-state error">
          {error || "Resource not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="resource-details-page">
      <button
        className="resource-back-button"
        onClick={() => navigate("/resource-hub")}
      >
        ← Back to Resource Hub
      </button>

      <article className="resource-details-card">
        <div className="resource-details-meta">
          <span className="resource-details-type">{resource.resourceType}</span>

          <span className="resource-details-category">{resource.category}</span>
        </div>

        <h1>{resource.title}</h1>

        <p className="resource-details-description">{resource.description}</p>

        <div className="resource-details-divider" />

        {resource.content && (
          <section className="resource-content-section">
            <h2>About This Resource</h2>

            <p>{resource.content}</p>
          </section>
        )}

        {resource.externalUrl && (
          <section className="resource-external-section">
            <h2>External Resource</h2>

            <p>
              This resource includes additional information available from the
              original source.
            </p>

            <a
              href={resource.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="resource-external-link"
            >
              Open External Resource →
            </a>
          </section>
        )}

        {resource.source && (
          <div className="resource-details-source">
            Source: {resource.source}
          </div>
        )}
      </article>
    </div>
  );
}

export default ResourceDetails;
