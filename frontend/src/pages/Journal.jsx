import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import "./Journal.css";

function Journal() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [emotion, setEmotion] = useState("");
  const [emotionIntensity, setEmotionIntensity] = useState(5);

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const emotions = [
    "Calm",
    "Happy",
    "Sad",
    "Angry",
    "Anxious",
    "Overwhelmed",
    "Confused",
    "Tired",
  ];

  // Load journal history
  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);

      const response = await apiFetch("/api/journal");

      if (!response) return;

      const data = await response.json();

      if (response.ok) {
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error("Error loading journal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setMessage("Please write something before saving.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await apiFetch("/api/journal", {
        method: "POST",
        body: JSON.stringify({
          title,
          content,
          emotion,
          emotionIntensity: emotion ? Number(emotionIntensity) : null,
        }),
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to save journal entry.");
        return;
      }

      setEntries((previousEntries) => [data.entry, ...previousEntries]);

      // Reset form
      setTitle("");
      setContent("");
      setEmotion("");
      setEmotionIntensity(5);

      setMessage("Your reflection has been saved.");
    } catch (error) {
      console.error("Journal save error:", error);
      setMessage("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this journal entry?",
    );

    if (!confirmed) return;

    try {
      const response = await apiFetch(`/api/journal/${id}`, {
        method: "DELETE",
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to delete entry.");
        return;
      }

      setEntries((previousEntries) =>
        previousEntries.filter((entry) => entry._id !== id),
      );

      setMessage("Journal entry deleted.");
    } catch (error) {
      console.error("Journal deletion error:", error);
      setMessage("Something went wrong while deleting.");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="journal-page">
      <div className="journal-header">
        <div>
          <h1>My Journal</h1>
          <p>
            A private space to pause, reflect, and put your thoughts into words.
          </p>
        </div>

        <div className="journal-header-icon">📖</div>
      </div>

      <div className="journal-layout">
        {/* Writing section */}
        <section className="journal-card journal-write-card">
          <div className="journal-card-heading">
            <div>
              <span className="journal-label">TODAY'S REFLECTION</span>
              <h2>How are you feeling?</h2>
            </div>
            <span className="journal-small-icon">✍️</span>
          </div>

          <form onSubmit={handleSave}>
            <label className="journal-field-label">
              Title
              <span>Optional</span>
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this reflection a name..."
              className="journal-title-input"
              maxLength={100}
            />

            <label className="journal-field-label">Your thoughts</label>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write freely. There is no right or wrong way to express yourself..."
              className="journal-textarea"
              rows={9}
            />

            <div className="journal-character-count">
              {content.length} characters
            </div>

            <label className="journal-field-label">
              What emotion is present?
              <span>Optional</span>
            </label>

            <div className="journal-emotions">
              {emotions.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`journal-emotion ${
                    emotion === item ? "selected" : ""
                  }`}
                  onClick={() => setEmotion(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            {emotion && (
              <div className="journal-intensity">
                <div className="journal-intensity-header">
                  <span>How intense does it feel?</span>
                  <strong>{emotionIntensity}/10</strong>
                </div>

                <input
                  type="range"
                  min="1"
                  max="10"
                  value={emotionIntensity}
                  onChange={(e) => setEmotionIntensity(Number(e.target.value))}
                />

                <div className="journal-range-labels">
                  <span>Gentle</span>
                  <span>Very intense</span>
                </div>
              </div>
            )}

            {message && <div className="journal-message">{message}</div>}

            <button
              type="submit"
              className="journal-save-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Reflection"}
            </button>
          </form>
        </section>

        {/* History section */}
        <section className="journal-card journal-history-card">
          <div className="journal-card-heading">
            <div>
              <span className="journal-label">YOUR JOURNAL</span>
              <h2>Past reflections</h2>
            </div>
            <span className="journal-small-icon">🌿</span>
          </div>

          {loading ? (
            <div className="journal-empty-state">
              <div className="journal-loading-icon">⏳</div>
              <p>Loading your reflections...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="journal-empty-state">
              <div className="journal-empty-icon">🌱</div>
              <h3>Your journal starts here</h3>
              <p>
                Your saved reflections will appear here. Take a moment whenever
                you need to check in with yourself.
              </p>
            </div>
          ) : (
            <div className="journal-entries">
              {entries.map((entry) => (
                <article className="journal-entry" key={entry._id}>
                  <div className="journal-entry-top">
                    <div>
                      <h3>{entry.title || "Untitled reflection"}</h3>

                      <span className="journal-entry-date">
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>

                    <button
                      className="journal-delete-button"
                      onClick={() => handleDelete(entry._id)}
                      title="Delete entry"
                    >
                      🗑️
                    </button>
                  </div>

                  {entry.emotion && (
                    <div className="journal-entry-emotion">
                      <span>{entry.emotion}</span>

                      {entry.emotionIntensity && (
                        <span>Intensity {entry.emotionIntensity}/10</span>
                      )}
                    </div>
                  )}

                  <p className="journal-entry-content">{entry.content}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Journal;
