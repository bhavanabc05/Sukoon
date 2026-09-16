import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import "./EmotionInsights.css";

function EmotionInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/api/emotion-insights");

      if (!response) return;

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Unable to load your emotional insights.");
        return;
      }

      setData(result);
    } catch (err) {
      console.error("Emotion insights error:", err);
      setError("Something went wrong while loading your insights.");
    } finally {
      setLoading(false);
    }
  };

  const formatEmotion = (emotion) => {
    if (!emotion) return "—";

    return emotion
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="insights-page">
        <div className="insights-loading">
          <div className="insights-loading-icon">🌿</div>
          <h2>Gathering your insights...</h2>
          <p>Sukoon is bringing together your recent emotional experiences.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="insights-page">
        <div className="insights-error">
          <h2>Unable to load insights</h2>
          <p>{error}</p>

          <button onClick={fetchInsights}>Try Again</button>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const mood = data?.mood || {};
  const emotions = data?.emotions || {};
  const stress = data?.stress || {};
  const phq4 = data?.phq4 || {};
  const journal = data?.journal || {};
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="insights-page">
      {/* Header */}
      <div className="insights-header">
        <div>
          <span className="insights-eyebrow">UNDERSTAND YOUR PATTERNS</span>

          <h1>Emotion Insights</h1>

          <p>A view of the emotional patterns you've recorded across Sukoon.</p>
        </div>

        <div className="insights-header-icon">🌿</div>
      </div>

      {/* Overview cards */}
      <section className="insights-overview">
        <div className="insight-stat-card">
          <span className="insight-stat-label">MOOD CHECK-INS</span>

          <strong>{summary.totalMoodCheckins || 0}</strong>

          <p>Recent check-ins recorded</p>
        </div>

        <div className="insight-stat-card">
          <span className="insight-stat-label">COMMON MOOD</span>

          <strong className="insight-emotion-value">
            {formatEmotion(mood.mostFrequent)}
          </strong>

          <p>Based on your recent check-ins</p>
        </div>

        <div className="insight-stat-card">
          <span className="insight-stat-label">MOOD INTENSITY</span>

          <strong>
            {mood.averageIntensity !== null &&
            mood.averageIntensity !== undefined
              ? `${mood.averageIntensity}/10`
              : "—"}
          </strong>

          <p>Average recorded intensity</p>
        </div>

        <div className="insight-stat-card">
          <span className="insight-stat-label">JOURNAL ENTRIES</span>

          <strong>{summary.totalJournalEntries || 0}</strong>

          <p>Reflections you've saved</p>
        </div>
      </section>

      {/* Main grid */}
      <div className="insights-grid">
        {/* Emotion patterns */}
        <section className="insight-card">
          <div className="insight-card-header">
            <div>
              <span className="insight-card-label">EMOTIONAL GRANULARITY</span>

              <h2>Emotions you've noticed</h2>
            </div>

            <span className="insight-card-icon">💭</span>
          </div>

          {emotions.frequentSpecificEmotions?.length > 0 ? (
            <div className="emotion-bars">
              {emotions.frequentSpecificEmotions.map((item) => {
                const maxCount =
                  emotions.frequentSpecificEmotions[0]?.count || 1;

                const percentage = (item.count / maxCount) * 100;

                return (
                  <div className="emotion-bar-row" key={item.emotion}>
                    <div className="emotion-bar-info">
                      <span>{formatEmotion(item.emotion)}</span>

                      <strong>{item.count}</strong>
                    </div>

                    <div className="emotion-bar-track">
                      <div
                        className="emotion-bar-fill"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="insight-empty">
              <span>💭</span>
              <p>
                More emotional-granularity entries will help reveal patterns
                here.
              </p>
            </div>
          )}
        </section>

        {/* Stress */}
        <section className="insight-card">
          <div className="insight-card-header">
            <div>
              <span className="insight-card-label">STRESS PATTERNS</span>

              <h2>Stress you've recorded</h2>
            </div>

            <span className="insight-card-icon">🌊</span>
          </div>

          <div className="stress-metrics">
            <div className="stress-metric">
              <span>Somatic stress</span>

              <strong>
                {stress.averageSomaticStress !== null &&
                stress.averageSomaticStress !== undefined
                  ? `${stress.averageSomaticStress}/10`
                  : "—"}
              </strong>

              <small>From body-sensation check-ins</small>
            </div>

            <div className="stress-metric">
              <span>Shift stress</span>

              <strong>
                {stress.averageShiftStress !== null &&
                stress.averageShiftStress !== undefined
                  ? `${stress.averageShiftStress}/10`
                  : "—"}
              </strong>

              <small>From shift check-ins</small>
            </div>
          </div>
        </section>

        {/* PHQ-4 */}
        <section className="insight-card">
          <div className="insight-card-header">
            <div>
              <span className="insight-card-label">PHQ-4</span>

              <h2>Latest assessment</h2>
            </div>

            <span className="insight-card-icon">📋</span>
          </div>

          {phq4.latest ? (
            <div className="phq-summary">
              <div className="phq-score">
                <strong>{phq4.latest.score}</strong>
                <span>/12</span>
              </div>

              <div className="phq-details">
                <p>
                  Interpretation:{" "}
                  <strong>{formatEmotion(phq4.latest.interpretation)}</strong>
                </p>

                <p>
                  Anxiety: <strong>{phq4.latest.anxietyScore}/6</strong>
                </p>

                <p>
                  Depression: <strong>{phq4.latest.depressionScore}/6</strong>
                </p>

                <small>Completed {formatDate(phq4.latest.completedAt)}</small>
              </div>
            </div>
          ) : (
            <div className="insight-empty">
              <span>📋</span>
              <p>Complete a PHQ-4 assessment to see your latest result here.</p>
            </div>
          )}
        </section>

        {/* Journal */}
        <section className="insight-card">
          <div className="insight-card-header">
            <div>
              <span className="insight-card-label">JOURNAL PATTERNS</span>

              <h2>Emotions in your reflections</h2>
            </div>

            <span className="insight-card-icon">📖</span>
          </div>

          {journal.frequentEmotions?.length > 0 ? (
            <div className="journal-emotion-list">
              {journal.frequentEmotions.map((item) => (
                <div className="journal-emotion-item" key={item.emotion}>
                  <span>{formatEmotion(item.emotion)}</span>

                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="insight-empty">
              <span>📖</span>
              <p>
                Add emotions to your journal reflections to discover patterns
                here.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Recent activity */}
      <section className="insight-card recent-activity-card">
        <div className="insight-card-header">
          <div>
            <span className="insight-card-label">RECENT ACTIVITY</span>

            <h2>Your recent emotional check-ins</h2>
          </div>

          <span className="insight-card-icon">🕊️</span>
        </div>

        {recentActivity.length > 0 ? (
          <div className="recent-activity-list">
            {recentActivity.map((activity, index) => (
              <div
                className="recent-activity-item"
                key={`${activity.type}-${activity.timestamp}-${index}`}
              >
                <div className="activity-dot" />

                <div className="activity-main">
                  <strong>{activity.label}</strong>

                  <span>
                    {activity.emotion
                      ? formatEmotion(activity.emotion)
                      : "Recorded"}
                  </span>
                </div>

                <div className="activity-meta">
                  {activity.intensity && (
                    <span>Intensity {activity.intensity}/10</span>
                  )}

                  {activity.stressLevel && (
                    <span>Stress {activity.stressLevel}/10</span>
                  )}

                  <small>{formatDate(activity.timestamp)}</small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="insight-empty recent-empty">
            <span>🌱</span>
            <p>
              Your recent emotional activity will appear here as you use Sukoon.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default EmotionInsights;
