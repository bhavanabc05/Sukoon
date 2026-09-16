import { useEffect, useState } from "react";
import "./PostShiftDecompression.css";
import { apiFetch } from "../utils/api";

import InterventionActivity from "../components/InterventionActivity";
import GroundingActivity from "../components/GroundingActivity";
import MindfulBreathingActivity from "../components/MindfulBreathingActivity";

function PostShiftDecompression() {
  const [shiftType, setShiftType] = useState("");
  const [mood, setMood] = useState("");
  const [moodIntensity, setMoodIntensity] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);

  const [selectedActivity, setSelectedActivity] = useState("");

  const [reflection, setReflection] = useState("");
  const [voiceTranscript, setVoiceTranscript] = useState("");

  const [stage, setStage] = useState("checkin");
  const [decompressionId, setDecompressionId] = useState(null);

  const [interventions, setInterventions] = useState([]);

  const [interventionsLoading, setInterventionsLoading] = useState(true);
  const [selectedIntervention, setSelectedIntervention] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const emotions = [
    "Calm",
    "Relieved",
    "Content",
    "Tired",
    "Exhausted",
    "Stressed",
    "Overwhelmed",
    "Anxious",
    "Frustrated",
    "Sad",
  ];

  const activities = [
    {
      type: "breathing",
      icon: "🌬️",
      title: "Calm my breathing",
      description: "Slow, guided breathing to help you settle.",
      duration: "2–3 min",
    },
    {
      type: "grounding",
      icon: "🌿",
      title: "Ground myself",
      description: "Reconnect with the present moment using your senses.",
      duration: "3–5 min",
    },
    {
      type: "mindfulness",
      icon: "🌿",
      title: "Mindful Breathing",
      description: "Slow down and bring your attention back to your breath.",
      duration: "2–3 min",
    },
    {
      type: "relaxation",
      icon: "🧘",
      title: "Release tension",
      description: "Take a moment to relax your body after the shift.",
      duration: "3–5 min",
    },
    {
      type: "reflection",
      icon: "📝",
      title: "Reflect briefly",
      description: "Put into words what stood out during your shift.",
      duration: "2–3 min",
    },
    {
      type: "none",
      icon: "💭",
      title: "Just pause",
      description: "Take a quiet moment without a guided activity.",
      duration: "1–2 min",
    },
  ];

  /*
   * Fetch the reusable intervention library.
   *
   * We use the existing intervention collection
   * instead of creating duplicate activities.
   */
  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        setInterventionsLoading(true);

        const response = await apiFetch("/api/interventions");

        if (!response) {
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch interventions.");
        }

        setInterventions(data.interventions || []);
      } catch (error) {
        console.error("Intervention library error:", error);

        setError(
          "Unable to load guided activities. Please refresh and try again.",
        );
      } finally {
        setInterventionsLoading(false);
      }
    };

    fetchInterventions();
  }, []);

  /*
   * Find the actual intervention that matches
   * the activity selected during decompression.
   */
  const getMatchingIntervention = (activityType) => {
    if (activityType === "breathing") {
      return interventions.find(
        (item) =>
          item.type === "breathing" && item.title === "Box Breathing Exercise",
      );
    }

    if (activityType === "grounding") {
      return interventions.find(
        (item) =>
          item.type === "grounding" && item.title === "5-4-3-2-1 Grounding",
      );
    }

    if (activityType === "mindfulness") {
      return interventions.find(
        (item) =>
          item.type === "mindfulness" && item.title === "Mindful Breathing",
      );
    }

    return null;
  };

  const handleContinue = async () => {
    if (!shiftType || !mood || !selectedActivity) {
      setError(
        "Please select your shift, current mood, and what would help you.",
      );
      return;
    }

    if (
      interventionsLoading &&
      (selectedActivity === "breathing" ||
        selectedActivity === "grounding" ||
        selectedActivity === "mindfulness")
    ) {
      setError("Please wait while the guided activity loads.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const matchingIntervention = getMatchingIntervention(selectedActivity);

      setSelectedIntervention(matchingIntervention || null);

      const selectedActivityData = activities.find(
        (item) => item.type === selectedActivity,
      );

      let activityDuration = 0;

      if (matchingIntervention) {
        activityDuration = matchingIntervention.durationMinutes;
      } else if (selectedActivity !== "none") {
        activityDuration = 3;
      }

      const response = await apiFetch("/api/post-shift-decompression", {
        method: "POST",
        body: JSON.stringify({
          shiftType,

          emotionalState: {
            mood: mood.toLowerCase(),
            intensity: moodIntensity,
          },

          stressLevel,
          energyLevel,

          selectedActivity,

          activityDuration,

          reflection,
          voiceTranscript,
        }),
      });

      if (!response) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to start decompression.");
      }

      setDecompressionId(data.decompression._id);

      setSuccessMessage(
        `Your post-shift check-in has been saved${
          selectedActivityData
            ? ` — ${selectedActivityData.title} is ready.`
            : "."
        }`,
      );

      setStage("activity");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!decompressionId || loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const response = await apiFetch(
        `/api/post-shift-decompression/${decompressionId}/complete`,
        {
          method: "PATCH",
        },
      );

      if (!response) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to complete decompression.");
      }

      setSuccessMessage("Post-shift decompression completed.");

      setStage("completed");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Voice input is not supported in this browser. Try Google Chrome or Microsoft Edge.",
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;

      setReflection((previous) =>
        previous.trim() ? `${previous} ${transcript}` : transcript,
      );

      setVoiceTranscript((previous) =>
        previous.trim() ? `${previous} ${transcript}` : transcript,
      );
    };

    recognition.onerror = () => {
      setError("Voice input could not be started. Please try again.");
    };

    recognition.start();
  };

  /*
   * Final completion screen
   */
  if (stage === "completed") {
    return (
      <div className="post-shift-page">
        <div className="post-shift-card completion-card">
          <div className="post-shift-completion-icon">🌿</div>

          <h1>You've finished your reset</h1>

          <p>
            Your shift is over. Take a slow breath, let your shoulders relax,
            and give yourself permission to transition out of work mode.
          </p>

          <div className="post-shift-success">{successMessage}</div>
        </div>
      </div>
    );
  }

  /*
   * Activity stage
   */
  if (stage === "activity") {
    /*
     * Breathing
     */
    if (selectedActivity === "breathing" && selectedIntervention) {
      return (
        <div className="post-shift-page">
          <div className="post-shift-card">
            <button
              className="post-shift-back"
              onClick={() => setStage("checkin")}
            >
              ← Back
            </button>

            <InterventionActivity
              intervention={selectedIntervention}
              onComplete={handleComplete}
            />
          </div>
        </div>
      );
    }

    /*
     * Grounding
     */
    if (selectedActivity === "grounding" && selectedIntervention) {
      return (
        <div className="post-shift-page">
          <div className="post-shift-card">
            <button
              className="post-shift-back"
              onClick={() => setStage("checkin")}
            >
              ← Back
            </button>

            <GroundingActivity
              intervention={selectedIntervention}
              onComplete={handleComplete}
            />
          </div>
        </div>
      );
    }

    if (selectedActivity === "mindfulness" && selectedIntervention) {
      return (
        <div className="post-shift-page">
          <div className="post-shift-card">
            <button
              className="post-shift-back"
              onClick={() => setStage("checkin")}
            >
              ← Back
            </button>

            <MindfulBreathingActivity
              intervention={selectedIntervention}
              onComplete={handleComplete}
            />
          </div>
        </div>
      );
    }

    /*
     * If a guided activity was selected but
     * the intervention library hasn't loaded,
     * show a useful message instead of crashing.
     */
    if (
      selectedActivity === "breathing" ||
      selectedActivity === "grounding" ||
      selectedActivity === "mindfulness"
    ) {
      return (
        <div className="post-shift-page">
          <div className="post-shift-card">
            <button
              className="post-shift-back"
              onClick={() => setStage("checkin")}
            >
              ← Back
            </button>

            <div className="post-shift-placeholder">
              <h2>Preparing your activity...</h2>

              <p>
                Your guided activity is being prepared. Please try again in a
                moment.
              </p>
            </div>

            {error && <div className="post-shift-error">{error}</div>}

            <button
              className="post-shift-complete-button"
              onClick={handleComplete}
              disabled={loading}
            >
              {loading ? "Completing..." : "Finish Decompression"}
            </button>
          </div>
        </div>
      );
    }

    /*
     * Non-guided activities
     */
    const activity = activities.find((item) => item.type === selectedActivity);

    return (
      <div className="post-shift-page">
        <div className="post-shift-card">
          <button
            className="post-shift-back"
            onClick={() => setStage("checkin")}
          >
            ← Back
          </button>

          <div className="post-shift-activity-icon">{activity?.icon}</div>

          <h1>{activity?.title}</h1>

          <p className="post-shift-activity-description">
            {activity?.description}
          </p>

          <div className="post-shift-duration">
            Suggested time: {activity?.duration}
          </div>

          {selectedActivity === "none" && (
            <div className="post-shift-pause">
              <h2>Take a quiet moment</h2>

              <p>
                There is nothing you need to solve right now. Simply pause and
                notice your breathing.
              </p>
            </div>
          )}

          {selectedActivity === "relaxation" && (
            <div className="post-shift-placeholder">
              <h2>Release some tension</h2>

              <p>
                Sit comfortably and slowly relax your shoulders, jaw, hands, and
                other areas where you notice tension.
              </p>

              <p>
                Take a few slow breaths and allow your body to settle after the
                shift.
              </p>
            </div>
          )}

          {selectedActivity === "reflection" && (
            <div className="post-shift-placeholder">
              <h2>A moment to reflect</h2>

              <p>Think about one thing that stood out during your shift.</p>

              {reflection && (
                <p>
                  <strong>Your reflection:</strong> {reflection}
                </p>
              )}
            </div>
          )}

          {error && <div className="post-shift-error">{error}</div>}

          <button
            className="post-shift-complete-button"
            onClick={handleComplete}
            disabled={loading}
          >
            {loading ? "Completing..." : "Finish Decompression"}
          </button>
        </div>
      </div>
    );
  }

  /*
   * Check-in stage
   */
  return (
    <div className="post-shift-page">
      <div className="post-shift-header">
        <h1>Post-Shift Decompression</h1>

        <p>
          Your shift is over. Take a moment to check in with yourself before
          moving on.
        </p>
      </div>

      <div className="post-shift-card">
        <div className="post-shift-section">
          <label>What type of shift did you just finish?</label>

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

        <div className="post-shift-section">
          <label>How are you feeling after your shift?</label>

          <div className="post-shift-emotions">
            {emotions.map((item) => (
              <button
                type="button"
                key={item}
                className={`post-shift-emotion ${
                  mood === item ? "post-shift-emotion-selected" : ""
                }`}
                onClick={() => setMood(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="post-shift-section">
          <div className="post-shift-slider-heading">
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

        <div className="post-shift-section">
          <div className="post-shift-slider-heading">
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

          <div className="post-shift-slider-labels">
            <span>Very low</span>
            <span>Very high</span>
          </div>
        </div>

        <div className="post-shift-section">
          <div className="post-shift-slider-heading">
            <label>How much energy do you have?</label>

            <span>{energyLevel}/10</span>
          </div>

          <input
            type="range"
            min="1"
            max="10"
            value={energyLevel}
            onChange={(event) => setEnergyLevel(Number(event.target.value))}
          />

          <div className="post-shift-slider-labels">
            <span>Very low</span>
            <span>Very high</span>
          </div>
        </div>

        <div className="post-shift-section">
          <label>What would help you right now?</label>

          <div className="post-shift-activity-grid">
            {activities.map((activity) => (
              <button
                type="button"
                key={activity.type}
                className={`post-shift-activity ${
                  selectedActivity === activity.type
                    ? "post-shift-activity-selected"
                    : ""
                }`}
                onClick={() => setSelectedActivity(activity.type)}
              >
                <span className="post-shift-activity-icon">
                  {activity.icon}
                </span>

                <strong>{activity.title}</strong>

                <span className="post-shift-activity-text">
                  {activity.description}
                </span>

                <small>{activity.duration}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="post-shift-section">
          <label>
            Want to leave a quick reflection?
            <span className="post-shift-optional"> (optional)</span>
          </label>

          <textarea
            value={reflection}
            onChange={(event) => {
              setReflection(event.target.value);

              setVoiceTranscript(event.target.value);
            }}
            placeholder="You can write a few words about your shift..."
            rows={4}
          />

          <button
            type="button"
            className="post-shift-voice-button"
            onClick={handleVoiceInput}
          >
            🎙️ Speak Instead
          </button>

          <p className="post-shift-voice-helper">
            Your speech will be converted into editable text.
          </p>
        </div>

        {error && <div className="post-shift-error">{error}</div>}

        {successMessage && (
          <div className="post-shift-success">{successMessage}</div>
        )}

        <button
          className="post-shift-submit-button"
          onClick={handleContinue}
          disabled={
            loading ||
            (interventionsLoading &&
              (selectedActivity === "breathing" ||
                selectedActivity === "grounding" ||
                selectedActivity === "mindfulness"))
          }
        >
          {loading
            ? "Saving..."
            : interventionsLoading &&
                (selectedActivity === "breathing" ||
                  selectedActivity === "grounding" ||
                  selectedActivity === "mindfulness")
              ? "Preparing activity..."
              : "Continue to Decompression →"}
        </button>
      </div>
    </div>
  );
}

export default PostShiftDecompression;
