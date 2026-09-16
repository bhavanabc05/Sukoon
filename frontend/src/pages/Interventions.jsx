import { useEffect, useState } from "react";
import InterventionActivity from "../components/InterventionActivity";
import "./Interventions.css";
import { apiFetch } from "../utils/api";
import GroundingActivity from "../components/GroundingActivity";
import MindfulBreathingActivity from "../components/MindfulBreathingActivity";
import ProgressiveMuscleRelaxationActivity from "../components/ProgressiveMuscleRelaxationActivity";
import GuidedReflectionActivity from "../components/GuidedReflectionActivity";

function Interventions() {
  const [interventions, setInterventions] = useState([]);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [userInterventionId, setUserInterventionId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await apiFetch("/api/interventions");

        if (!response) {
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch interventions");
        }

        setInterventions(data.interventions);
      } catch (error) {
        console.error("Intervention fetch error:", error);
        setError("Unable to load interventions.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterventions();
  }, []);

  const handleStart = async (intervention) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccessMessage("");

      const response = await apiFetch("/api/interventions/start", {
        method: "POST",
        body: JSON.stringify({
          interventionId: intervention._id,
        }),
      });

      if (!response) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to start intervention");
      }

      setSelectedIntervention(intervention);
      setUserInterventionId(data.intervention._id);
    } catch (error) {
      console.error("Start intervention error:", error);
      setError("Unable to start intervention.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!userInterventionId || actionLoading) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccessMessage("");

      const response = await apiFetch(
        `/api/interventions/${userInterventionId}/complete`,
        {
          method: "PATCH",
        },
      );

      if (!response) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to complete intervention");
      }

      setSuccessMessage("Intervention completed successfully.");

      setUserInterventionId(null);

      setTimeout(() => {
        setSelectedIntervention(null);
        setSuccessMessage("");
      }, 1200);
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1>Interventions</h1>
        <p>Loading wellbeing activities...</p>
      </div>
    );
  }

  if (error && !selectedIntervention) {
    return (
      <div>
        <h1>Interventions</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (selectedIntervention) {
    return (
      <div className="intervention-activity-page">
        <button
          className="intervention-back-button"
          onClick={() => {
            setSelectedIntervention(null);
            setUserInterventionId(null);
            setError("");
            setSuccessMessage("");
          }}
        >
          ← Back to Interventions
        </button>

        {selectedIntervention.type === "breathing" ? (
          <InterventionActivity
            intervention={selectedIntervention}
            onComplete={handleComplete}
          />
        ) : selectedIntervention.type === "grounding" ? (
          <GroundingActivity
            intervention={selectedIntervention}
            onComplete={handleComplete}
          />
        ) : selectedIntervention.type === "mindfulness" &&
          selectedIntervention.title === "Mindful Breathing" ? (
          <MindfulBreathingActivity
            intervention={selectedIntervention}
            onComplete={handleComplete}
          />
        ) : selectedIntervention.type === "relaxation" ? (
          <ProgressiveMuscleRelaxationActivity
            intervention={selectedIntervention}
            onComplete={handleComplete}
          />
        ) : selectedIntervention.type === "reflection" ? (
          <GuidedReflectionActivity
            intervention={selectedIntervention}
            onComplete={handleComplete}
          />
        ) : (
          <div>
            <h1>{selectedIntervention.title}</h1>

            <p>{selectedIntervention.description}</p>

            <p>
              <strong>Duration:</strong> {selectedIntervention.durationMinutes}{" "}
              minutes
            </p>

            <h2>Instructions</h2>

            <ol>
              {selectedIntervention.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>

            <button onClick={handleComplete}>Complete Intervention</button>
          </div>
        )}

        {error && <p>{error}</p>}

        {successMessage && <p>{successMessage}</p>}
      </div>
    );
  }

  return (
    <div className="interventions-page">
      <div className="interventions-header">
        <h1>Interventions</h1>

        <p>
          Explore wellbeing exercises and activities that may help you take a
          moment for yourself.
        </p>
      </div>

      {interventions.length === 0 ? (
        <p>No interventions are currently available.</p>
      ) : (
        <div className="intervention-grid">
          {interventions.map((intervention) => (
            <div className="intervention-card" key={intervention._id}>
              <span className="intervention-type">{intervention.type}</span>

              <h2>{intervention.title}</h2>

              <p>{intervention.description}</p>

              <p className="intervention-duration">
                ⏱ {intervention.durationMinutes} minutes
              </p>

              <p className="intervention-suitable">
                <strong>Suitable for:</strong>{" "}
                {intervention.suitableFor.join(", ")}
              </p>

              <button
                className="intervention-start-button"
                onClick={() => handleStart(intervention)}
                disabled={actionLoading}
              >
                {actionLoading ? "Starting..." : "Start"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Interventions;
