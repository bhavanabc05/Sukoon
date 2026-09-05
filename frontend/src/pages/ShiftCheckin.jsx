import { useState } from "react";
import "./ShiftCheckin.css";

function ShiftCheckin() {
  const token = localStorage.getItem("token");

  const [shiftType, setShiftType] = useState("");
  const [emotion, setEmotion] = useState("");
  const [moodIntensity, setMoodIntensity] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [emotionalReadiness, setEmotionalReadiness] = useState(5);
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const emotions = [
    "Calm",
    "Happy",
    "Hopeful",
    "Focused",
    "Anxious",
    "Sad",
    "Frustrated",
    "Overwhelmed",
    "Tired",
    "Other",
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!shiftType || !emotion) {
      setError("Please select your shift type and current mood.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch("http://localhost:5000/api/shift-checkins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shiftType,
          mood: {
            emotion: emotion.toLowerCase(),
            intensity: moodIntensity,
          },
          energyLevel,
          stressLevel,
          emotionalReadiness,
          note,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save shift check-in.");
      }

      setSuccessMessage("Your shift check-in has been recorded.");

      setShiftType("");
      setEmotion("");
      setMoodIntensity(5);
      setEnergyLevel(5);
      setStressLevel(5);
      setEmotionalReadiness(5);
      setNote("");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shift-checkin-page">
      <div className="shift-checkin-header">
        <h1>Shift Check-in</h1>

        <p>Take a moment to check in with yourself before your shift begins.</p>
      </div>

      <form className="shift-checkin-card" onSubmit={handleSubmit}>
        <div className="shift-section">
          <label>What type of shift are you starting?</label>

          <select
            value={shiftType}
            onChange={(event) => setShiftType(event.target.value)}
          >
            <option value="">Select shift type</option>

            <option value="Day Shift">Day Shift</option>

            <option value="Evening Shift">Evening Shift</option>

            <option value="Night Shift">Night Shift</option>

            <option value="Rotating Shift">Rotating Shift</option>

            <option value="Other">Other</option>
          </select>
        </div>

        <div className="shift-section">
          <label>How are you feeling right now?</label>

          <div className="emotion-grid">
            {emotions.map((item) => (
              <button
                type="button"
                key={item}
                className={`emotion-option ${
                  emotion === item ? "emotion-option-selected" : ""
                }`}
                onClick={() => setEmotion(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="shift-section">
          <div className="slider-heading">
            <label>How intense is this feeling?</label>
            <span>{moodIntensity}/10</span>
          </div>

          <input
            type="range"
            min="1"
            max="10"
            value={moodIntensity}
            onChange={(event) => setMoodIntensity(Number(event.target.value))}
          />
        </div>

        <div className="shift-section">
          <div className="slider-heading">
            <label>How energetic do you feel?</label>
            <span>{energyLevel}/10</span>
          </div>

          <input
            type="range"
            min="1"
            max="10"
            value={energyLevel}
            onChange={(event) => setEnergyLevel(Number(event.target.value))}
          />

          <div className="slider-labels">
            <span>Very low</span>
            <span>Very high</span>
          </div>
        </div>

        <div className="shift-section">
          <div className="slider-heading">
            <label>How stressed do you feel?</label>
            <span>{stressLevel}/10</span>
          </div>

          <input
            type="range"
            min="1"
            max="10"
            value={stressLevel}
            onChange={(event) => setStressLevel(Number(event.target.value))}
          />

          <div className="slider-labels">
            <span>Very low</span>
            <span>Very high</span>
          </div>
        </div>

        <div className="shift-section">
          <div className="slider-heading">
            <label>How emotionally ready do you feel?</label>

            <span>{emotionalReadiness}/10</span>
          </div>

          <input
            type="range"
            min="1"
            max="10"
            value={emotionalReadiness}
            onChange={(event) =>
              setEmotionalReadiness(Number(event.target.value))
            }
          />

          <div className="slider-labels">
            <span>Not ready</span>
            <span>Very ready</span>
          </div>
        </div>

        <div className="shift-section">
          <label>
            Anything you'd like to note?
            <span className="optional-label"> (optional)</span>
          </label>

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="You can briefly describe what's on your mind..."
            rows={4}
          />
        </div>

        {error && <div className="shift-error">{error}</div>}

        {successMessage && (
          <div className="shift-success">{successMessage}</div>
        )}

        <button
          type="submit"
          className="shift-submit-button"
          disabled={loading}
        >
          {loading ? "Saving..." : "Complete Check-in"}
        </button>
      </form>
    </div>
  );
}

export default ShiftCheckin;
