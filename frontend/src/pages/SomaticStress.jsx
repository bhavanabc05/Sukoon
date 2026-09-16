import { useState } from "react";
import SomaticBodyMap from "../components/SomaticBodyMap";
import "./SomaticStress.css";
import { apiFetch } from "../utils/api";

function SomaticStress() {
  const [symptoms, setSymptoms] = useState([]);
  const [severity, setSeverity] = useState(5);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (symptoms.length === 0) {
      setError("Please select at least one body area.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiFetch("/api/somatic-stress", {
        method: "POST",
        body: JSON.stringify({
          symptoms,
          severity: Number(severity),
        }),
      });

      if (!response) {
        return;
      }
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save somatic stress record.",
        );
      }

      setMessage("Your somatic stress reflection has been saved.");

      setSymptoms([]);
      setSeverity(5);
    } catch (error) {
      console.error("Somatic stress error:", error);

      setError(error.message || "Something went wrong while saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="somatic-page">
      <div className="somatic-header">
        <p className="page-label">NOTICE YOUR BODY</p>

        <h1>Somatic Stress Mapping</h1>

        <p>
          Notice where stress shows up in your body and describe its intensity.
        </p>
      </div>

      <form className="somatic-card" onSubmit={handleSubmit}>
        <section className="somatic-section">
          <div className="section-heading">
            <span className="section-number">1</span>

            <div>
              <h2>Where do you feel stress?</h2>

              <p>Select one or more areas of your body.</p>
            </div>
          </div>

          <SomaticBodyMap onChange={setSymptoms} />
        </section>

        <section className="severity-section">
          <div className="section-heading">
            <span className="section-number">2</span>

            <div>
              <h2>Overall physical stress</h2>

              <p>How intense does the physical stress feel overall?</p>
            </div>
          </div>

          <div className="severity-control">
            <div className="severity-value">
              <strong>{severity}/10</strong>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              value={severity}
              onChange={(event) => setSeverity(event.target.value)}
            />

            <div className="severity-labels">
              <span>Very mild</span>
              <span>Very strong</span>
            </div>
          </div>
        </section>

        {error && <p className="somatic-error">{error}</p>}

        {message && <p className="somatic-success">{message}</p>}

        <button type="submit" className="somatic-submit" disabled={loading}>
          {loading ? "Saving..." : "Save Somatic Reflection"}
        </button>
      </form>
    </div>
  );
}

export default SomaticStress;
