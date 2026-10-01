import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import "./ResourceHub.css";

function ResourceHub() {
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categories = [
    "All",
    "Stress Management",
    "Mental Wellbeing",
    "Sleep & Recovery",
    "Emotional Wellbeing",
    "Self-Care",
    "Workplace Wellbeing",
    "Mindfulness",
    "Journaling",
  ];

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
      console.error("Resource loading error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredResources = resources.filter((resource) => {
    const matchesCategory =
      selectedCategory === "All" || resource.category === selectedCategory;

    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      resource.title.toLowerCase().includes(search) ||
      resource.description.toLowerCase().includes(search) ||
      resource.category.toLowerCase().includes(search);

    return matchesCategory && matchesSearch;
  });

  function handleResourceClick(resourceId) {
    navigate(`/resources/${resourceId}`);
  }

  return (
    <div className="resource-hub-page">
      <div className="resource-hub-header">
        <div>
          <p className="resource-eyebrow">SUKOON RESOURCE HUB</p>

          <h1>Resources for Your Wellbeing</h1>

          <p className="resource-intro">
            Explore practical resources to support emotional wellbeing, stress
            management, recovery, mindfulness, and healthy workplace habits.
          </p>
        </div>
      </div>

      <div className="resource-controls">
        <div className="resource-search">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="resource-categories">
          {categories.map((category) => (
            <button
              key={category}
              className={
                selectedCategory === category
                  ? "resource-category active"
                  : "resource-category"
              }
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="resource-state">Loading resources...</div>}

      {!loading && error && <div className="resource-state error">{error}</div>}

      {!loading && !error && (
        <>
          <div className="resource-results-header">
            <h2>Explore Resources</h2>

            <span>
              {filteredResources.length}{" "}
              {filteredResources.length === 1 ? "resource" : "resources"}
            </span>
          </div>

          {filteredResources.length === 0 ? (
            <div className="resource-empty">
              <h3>No resources found</h3>
              <p>Try a different search term or category.</p>
            </div>
          ) : (
            <div className="resource-grid">
              {filteredResources.map((resource) => (
                <article
                  className="resource-card"
                  key={resource._id}
                  onClick={() => handleResourceClick(resource._id)}
                >
                  <div className="resource-card-top">
                    <span className="resource-type">
                      {resource.resourceType}
                    </span>

                    <span className="resource-category-label">
                      {resource.category}
                    </span>
                  </div>

                  <h3>{resource.title}</h3>

                  <p>{resource.description}</p>

                  <div className="resource-card-footer">
                    <span>{resource.source || "Sukoon"}</span>

                    <span className="resource-view">View →</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ResourceHub;
