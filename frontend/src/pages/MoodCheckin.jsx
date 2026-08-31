import { useState } from "react";
import "./MoodCheckin.css";
const emotions = [
  { name: "Calm", emoji: "😌" },
  { name: "Content", emoji: "🙂" },
  { name: "Happy", emoji: "😊" },
  { name: "Sad", emoji: "😔" },
  { name: "Anxious", emoji: "😟" },
  { name: "Angry", emoji: "😠" },
  { name: "Stressed", emoji: "😫" },
  { name: "Overwhelmed", emoji: "😵" },
  { name: "Tired", emoji: "😴" },
  { name: "Numb", emoji: "😐" },
];

function MoodCheckin() {
  const [selectedMood, setSelectedMood] = useState("");
  const [intensity, setIntensity] = useState(5);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!selectedMood) {
      setError("Please select how you are feeling.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Your session has expired. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/moods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mood: selectedMood,
          intensity: Number(intensity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to save mood check-in.");
        return;
      }

      setMessage("Your mood check-in has been saved.");

      setSelectedMood("");
      setIntensity(5);
    } catch (error) {
      console.error("Mood check-in error:", error);
      setError("Unable to connect to Sukoon server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mood-page">
      <div className="mood-header">
        <h1>Mood Check-in</h1>

        <p>
          Take a moment to check in with yourself. There is no right or wrong
          answer.
        </p>
      </div>

      <form className="mood-card" onSubmit={handleSubmit}>
        <h2>How are you feeling right now?</h2>

        <div className="emotion-grid">
          {emotions.map((emotion) => (
            <button
              key={emotion.name}
              type="button"
              className={`emotion-option ${
                selectedMood === emotion.name.toLowerCase() ? "selected" : ""
              }`}
              onClick={() => setSelectedMood(emotion.name.toLowerCase())}
            >
              <span className="emotion-emoji">{emotion.emoji}</span>

              <span>{emotion.name}</span>
            </button>
          ))}
        </div>

        <div className="intensity-section">
          <h2>How strongly are you feeling this?</h2>

          <div className="intensity-value">{intensity}/10</div>

          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(event) => setIntensity(event.target.value)}
          />

          <div className="intensity-labels">
            <span>Very mild</span>
            <span>Very strong</span>
          </div>
        </div>

        {error && <p className="mood-error">{error}</p>}

        {message && <p className="mood-success">{message}</p>}

        <button type="submit" className="mood-submit" disabled={loading}>
          {loading ? "Saving..." : "Save Check-in"}
        </button>
      </form>
    </div>
  );
}

export default MoodCheckin;
