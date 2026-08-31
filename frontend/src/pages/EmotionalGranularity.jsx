import { useState } from "react";
import "./EmotionalGranularity.css";
import EmotionWheel from "../components/EmotionWheel";

const emotionData = {
  sad: {
    label: "Sad",
    emoji: "😔",
    children: {
      lonely: ["isolated", "unwanted", "alone"],
      disappointed: ["let down", "discouraged", "disheartened"],
      hurt: ["wounded", "rejected", "betrayed"],
    },
  },

  angry: {
    label: "Angry",
    emoji: "😠",
    children: {
      frustrated: ["irritated", "annoyed", "exasperated"],
      resentful: ["bitter", "aggrieved", "displeased"],
      offended: ["insulted", "disrespected", "provoked"],
    },
  },

  fear: {
    label: "Fear",
    emoji: "😨",
    children: {
      anxious: ["worried", "nervous", "uneasy"],
      insecure: ["uncertain", "self-doubting", "vulnerable"],
      overwhelmed: ["panicked", "helpless", "threatened"],
    },
  },

  joy: {
    label: "Joy",
    emoji: "😊",
    children: {
      happy: ["cheerful", "pleased", "delighted"],
      grateful: ["thankful", "appreciative", "blessed"],
      hopeful: ["optimistic", "encouraged", "confident"],
    },
  },

  calm: {
    label: "Calm",
    emoji: "😌",
    children: {
      peaceful: ["relaxed", "serene", "tranquil"],
      content: ["satisfied", "comfortable", "at ease"],
      safe: ["secure", "protected", "supported"],
    },
  },

  disgust: {
    label: "Disgust",
    emoji: "🤢",
    children: {
      uncomfortable: ["uneasy", "disturbed", "bothered"],
      disapproving: ["critical", "judgmental", "dismissive"],
      repulsed: ["revolted", "nauseated", "averse"],
    },
  },
};

function EmotionalGranularity() {
  const [primaryEmotion, setPrimaryEmotion] = useState("");
  const [secondaryEmotion, setSecondaryEmotion] = useState("");
  const [specificEmotion, setSpecificEmotion] = useState("");
  const [intensity, setIntensity] = useState(5);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedPrimary = emotionData[primaryEmotion];

  const secondaryOptions = selectedPrimary
    ? Object.keys(selectedPrimary.children)
    : [];

  const specificOptions =
    selectedPrimary && secondaryEmotion
      ? selectedPrimary.children[secondaryEmotion]
      : [];

  const handlePrimarySelect = (emotion) => {
    setPrimaryEmotion(emotion);
    setSecondaryEmotion("");
    setSpecificEmotion("");
    setMessage("");
    setError("");
  };

  const handleSecondarySelect = (emotion) => {
    setSecondaryEmotion(emotion);
    setSpecificEmotion("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!primaryEmotion || !secondaryEmotion || !specificEmotion) {
      setError("Please complete all three emotion levels.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Your session has expired. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/emotional-granularity",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            primaryEmotion,
            secondaryEmotion,
            specificEmotion,
            intensity: Number(intensity),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to save emotional check-in.");
        return;
      }

      setMessage("Your emotional reflection has been saved.");

      setPrimaryEmotion("");
      setSecondaryEmotion("");
      setSpecificEmotion("");
      setIntensity(5);
    } catch (error) {
      console.error("Emotional granularity error:", error);

      setError("Unable to connect to Sukoon server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="granularity-page">
      <div className="granularity-header">
        <p className="page-label">UNDERSTAND YOUR EMOTIONS</p>

        <h1>Emotional Granularity</h1>

        <p>
          Move from a broad feeling to a more precise description of what you're
          experiencing.
        </p>
      </div>

      <form className="granularity-card" onSubmit={handleSubmit}>
        <section className="wheel-section">
          <div className="level-heading">
            <span className="level-number">1</span>

            <div>
              <h2>Explore what you're feeling</h2>

              <p>
                Start with a broad emotion and move toward a more precise
                feeling.
              </p>
            </div>
          </div>

          <EmotionWheel
            onSelectionChange={(selection) => {
              setPrimaryEmotion(selection.primaryEmotion);

              setSecondaryEmotion(selection.secondaryEmotion);

              setSpecificEmotion(selection.specificEmotion);
            }}
          />
        </section>

        {specificEmotion && (
          <section className="emotion-level">
            <div className="level-heading">
              <span className="level-number">4</span>

              <div>
                <h2>How strongly are you experiencing this?</h2>

                <p>Rate the intensity of this emotion from 1 to 10.</p>
              </div>
            </div>

            <div className="granularity-intensity">
              <strong>{intensity}/10</strong>

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
          </section>
        )}

        {error && <p className="granularity-error">{error}</p>}

        {message && <p className="granularity-success">{message}</p>}

        {specificEmotion && (
          <button
            type="submit"
            className="granularity-submit"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Emotional Reflection"}
          </button>
        )}
      </form>
    </div>
  );
}

export default EmotionalGranularity;
