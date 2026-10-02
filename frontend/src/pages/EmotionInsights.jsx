import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../utils/api";
import "./EmotionInsights.css";

function EmotionBars({ items = [] }) {
  if (!items.length) {
    return (
      <div className="insight-empty">
        <span>🌱</span>
        <p>No recorded patterns yet.</p>
      </div>
    );
  }

  const maxCount = Math.max(...items.map((item) => item.count || 0), 1);

  return (
    <div className="emotion-bars">
      {items.map((item) => {
        const percentage = ((item.count || 0) / maxCount) * 100;

        return (
          <div className="emotion-bar-row" key={item.emotion}>
            <div className="emotion-bar-info">
              <span>{formatEmotion(item.emotion)}</span>
              <strong>{item.count}</strong>
            </div>

            <div className="emotion-bar-track">
              <div
                className="emotion-bar-fill"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SimpleLineChart({ data = [], valueKey, emptyText }) {
  if (!data.length) {
    return (
      <div className="chart-empty">
        <span>📈</span>
        <p>{emptyText}</p>
      </div>
    );
  }

  const width = 700;
  const height = 260;
  const padding = {
    top: 20,
    right: 25,
    bottom: 45,
    left: 45,
  };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map((item) => Number(item[valueKey]) || 0);

  const maxValue = Math.max(...values, 10);
  const minValue = 0;

  const getX = (index) => {
    if (data.length === 1) return padding.left + chartWidth / 2;

    return padding.left + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (value) => {
    return (
      padding.top +
      chartHeight -
      ((value - minValue) / (maxValue - minValue)) * chartHeight
    );
  };

  const points = data
    .map((item, index) => `${getX(index)},${getY(Number(item[valueKey]) || 0)}`)
    .join(" ");

  const yTicks = [0, 2.5, 5, 7.5, 10];

  const labelIndexes =
    data.length <= 6
      ? data.map((_, index) => index)
      : [0, Math.floor(data.length / 2), data.length - 1];

  return (
    <div className="chart-wrapper">
      <svg
        className="line-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Trend chart"
      >
        {yTicks.map((tick) => {
          const y = getY(tick);

          return (
            <g key={tick}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                className="chart-grid-line"
              />

              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="chart-axis-label"
              >
                {tick}
              </text>
            </g>
          );
        })}

        <polyline points={points} fill="none" className="chart-line" />

        {data.map((item, index) => (
          <circle
            key={`${item.date}-${index}`}
            cx={getX(index)}
            cy={getY(Number(item[valueKey]) || 0)}
            r="4"
            className="chart-point"
          />
        ))}

        {labelIndexes.map((index) => {
          const item = data[index];

          return (
            <text
              key={`label-${item.date}-${index}`}
              x={getX(index)}
              y={height - 15}
              textAnchor="middle"
              className="chart-date-label"
            >
              {formatShortDate(item.date)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function ModalityChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="chart-empty">
        <span>📊</span>
        <p>No emotion-detection activity recorded yet.</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((item) => item.count || 0), 1);

  return (
    <div className="modality-chart">
      {data.map((item) => {
        const percentage = ((item.count || 0) / maxCount) * 100;

        return (
          <div className="modality-row" key={item.modality}>
            <div className="modality-info">
              <span>{item.modality}</span>
              <strong>{item.count}</strong>
            </div>

            <div className="modality-track">
              <div
                className="modality-fill"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatEmotion(emotion) {
  if (!emotion) return "—";

  return emotion
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatShortDate(date) {
  if (!date) return "";

  return new Date(`${date}T00:00:00`).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function getActivityDescription(activity) {
  if (activity.type === "challenge") {
    return `Day ${activity.day || "—"} completed`;
  }

  if (activity.type === "text_emotion") {
    return activity.emotion
      ? `${formatEmotion(activity.emotion)} detected from text`
      : "Text emotion analyzed";
  }

  if (activity.type === "audio_emotion") {
    return activity.emotion
      ? `${formatEmotion(activity.emotion)} detected from voice`
      : "Voice emotion analyzed";
  }

  if (activity.type === "video_emotion") {
    return activity.emotion
      ? `${formatEmotion(activity.emotion)} detected from video`
      : "Video emotion analyzed";
  }

  if (activity.type === "guided_reflection") {
    return activity.emotion
      ? `${formatEmotion(activity.emotion)} recorded during reflection`
      : "Guided reflection completed";
  }

  if (activity.type === "phq4") {
    return "PHQ-4 assessment completed";
  }

  if (activity.emotion) {
    return formatEmotion(activity.emotion);
  }

  return "Activity recorded";
}

function getActivityIcon(type) {
  const icons = {
    mood: "🙂",
    emotional_granularity: "💭",
    somatic_stress: "🫶",
    shift_checkin: "🩺",
    post_shift: "🌙",
    journal: "📖",
    text_emotion: "💬",
    audio_emotion: "🎙️",
    video_emotion: "🎥",
    guided_reflection: "🧘",
    phq4: "📋",
    challenge: "🏆",
  };

  return icons[type] || "🌿";
}

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

  const summary = data?.summary || {};
  const mood = data?.mood || {};
  const emotions = data?.emotions || {};
  const stress = data?.stress || {};
  const phq4 = data?.phq4 || {};
  const journal = data?.journal || {};
  const audioEmotion = data?.audioEmotion || {};
  const textEmotion = data?.textEmotion || {};
  const videoEmotion = data?.videoEmotion || {};
  const guidedReflection = data?.guidedReflection || {};
  const trends = data?.trends || {};
  const recentActivity = data?.recentActivity || [];

  const activityCountText = useMemo(() => {
    return summary.totalActivities || 0;
  }, [summary.totalActivities]);

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

  return (
    <div className="insights-page">
      <div className="insights-header">
        <div>
          <span className="insights-eyebrow">UNDERSTAND YOUR PATTERNS</span>

          <h1>Emotion Insights</h1>

          <p>A view of the emotional patterns you've recorded across Sukoon.</p>
        </div>

        <div className="insights-header-icon">🌿</div>
      </div>

      {/* Overview */}
      <section className="insights-overview">
        <div className="insight-stat-card">
          <span className="insight-stat-label">TOTAL ACTIVITIES</span>

          <strong>{activityCountText}</strong>

          <p>Recorded across Sukoon</p>
        </div>

        <div className="insight-stat-card">
          <span className="insight-stat-label">MOOD CHECK-INS</span>

          <strong>{summary.totalMoodCheckins || 0}</strong>

          <p>Check-ins recorded</p>
        </div>

        <div className="insight-stat-card">
          <span className="insight-stat-label">COMMON MOOD</span>

          <strong className="insight-emotion-value">
            {formatEmotion(mood.mostFrequent)}
          </strong>

          <p>Most frequent recent mood</p>
        </div>

        <div className="insight-stat-card">
          <span className="insight-stat-label">JOURNAL ENTRIES</span>

          <strong>{summary.totalJournalEntries || 0}</strong>

          <p>Reflections saved</p>
        </div>

        <div className="insight-stat-card">
          <span className="insight-stat-label">TEXT ANALYSES</span>

          <strong>{summary.totalTextEmotionRecords || 0}</strong>

          <p>Text emotions detected</p>
        </div>

        <div className="insight-stat-card">
          <span className="insight-stat-label">VOICE ANALYSES</span>

          <strong>{summary.totalAudioEmotionRecords || 0}</strong>

          <p>Voice emotions detected</p>
        </div>

        <div className="insight-stat-card">
          <span className="insight-stat-label">VIDEO ANALYSES</span>

          <strong>{summary.totalVideoEmotionRecords || 0}</strong>

          <p>Video emotions detected</p>
        </div>

        <div className="insight-stat-card">
          <span className="insight-stat-label">REFLECTIONS</span>

          <strong>{summary.totalGuidedReflections || 0}</strong>

          <p>Guided reflections completed</p>
        </div>
      </section>

      {/* Trend charts */}
      <section className="insights-chart-grid">
        <div className="insight-card chart-card">
          <div className="insight-card-header">
            <div>
              <span className="insight-card-label">EMOTIONAL TREND</span>

              <h2>Emotional intensity over time</h2>
            </div>

            <span className="insight-card-icon">📈</span>
          </div>

          <p className="chart-description">
            Average emotional intensity from activities where intensity was
            recorded.
          </p>

          <SimpleLineChart
            data={trends.emotionalIntensity}
            valueKey="averageIntensity"
            emptyText="Record more emotional check-ins to see your trend."
          />
        </div>

        <div className="insight-card chart-card">
          <div className="insight-card-header">
            <div>
              <span className="insight-card-label">STRESS TREND</span>

              <h2>Stress patterns over time</h2>
            </div>

            <span className="insight-card-icon">🌊</span>
          </div>

          <p className="chart-description">
            Average stress levels recorded through stress and shift-related
            activities.
          </p>

          <SimpleLineChart
            data={trends.stress}
            valueKey="averageStress"
            emptyText="Record more stress-related activities to see your trend."
          />
        </div>
      </section>

      <section className="insights-chart-grid">
        <div className="insight-card">
          <div className="insight-card-header">
            <div>
              <span className="insight-card-label">DETECTION MODALITIES</span>

              <h2>How you've explored emotions</h2>
            </div>

            <span className="insight-card-icon">📊</span>
          </div>

          <p className="chart-description">
            Number of emotion analyses recorded through each available modality.
          </p>

          <ModalityChart data={trends.modalityUsage} />
        </div>

        <div className="insight-card">
          <div className="insight-card-header">
            <div>
              <span className="insight-card-label">EMOTIONAL GRANULARITY</span>

              <h2>Emotions you've noticed</h2>
            </div>

            <span className="insight-card-icon">💭</span>
          </div>

          <EmotionBars items={emotions.frequentSpecificEmotions} />
        </div>
      </section>

      {/* Emotion detection modules */}
      <div className="insights-grid">
        <section className="insight-card">
          <div className="insight-card-header">
            <div>
              <span className="insight-card-label">TEXT EMOTION</span>

              <h2>Emotions detected from text</h2>
            </div>

            <span className="insight-card-icon">💬</span>
          </div>

          <EmotionBars items={textEmotion.frequentEmotions} />
        </section>

        <section className="insight-card">
          <div className="insight-card-header">
            <div>
              <span className="insight-card-label">VOICE EMOTION</span>

              <h2>Emotions detected in your voice</h2>
            </div>

            <span className="insight-card-icon">🎙️</span>
          </div>

          <EmotionBars items={audioEmotion.frequentEmotions} />
        </section>

        <section className="insight-card">
          <div className="insight-card-header">
            <div>
              <span className="insight-card-label">VIDEO EMOTION</span>

              <h2>Emotions detected from video</h2>
            </div>

            <span className="insight-card-icon">🎥</span>
          </div>

          <EmotionBars items={videoEmotion.frequentEmotions} />
        </section>

        <section className="insight-card">
          <div className="insight-card-header">
            <div>
              <span className="insight-card-label">GUIDED REFLECTION</span>

              <h2>Emotions from reflection</h2>
            </div>

            <span className="insight-card-icon">🧘</span>
          </div>

          <EmotionBars items={guidedReflection.frequentEmotions} />
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

        {/* PHQ4 */}
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

        {/* Challenges */}
        <section className="insight-card">
          <div className="insight-card-header">
            <div>
              <span className="insight-card-label">CHALLENGES</span>

              <h2>Wellbeing challenge activity</h2>
            </div>

            <span className="insight-card-icon">🏆</span>
          </div>

          <div className="challenge-insight">
            <strong>{summary.totalChallengeActivities || 0}</strong>

            <span>challenge tasks completed</span>

            <small>
              Challenge activity is included in your overall Sukoon activity
              history.
            </small>
          </div>
        </section>
      </div>

      {/* Recent activity */}
      <section className="insight-card recent-activity-card">
        <div className="insight-card-header">
          <div>
            <span className="insight-card-label">RECENT ACTIVITY</span>

            <h2>Your recent Sukoon activity</h2>
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
                <div className="activity-icon">
                  {getActivityIcon(activity.type)}
                </div>

                <div className="activity-main">
                  <strong>{activity.label}</strong>

                  <span>{getActivityDescription(activity)}</span>

                  {activity.type === "audio_emotion" &&
                    activity.confidence !== undefined && (
                      <small>
                        Voice confidence:{" "}
                        {Math.round(activity.confidence * 100)}%
                      </small>
                    )}

                  {activity.type === "text_emotion" &&
                    activity.confidence !== undefined && (
                      <small>
                        Text confidence: {Math.round(activity.confidence * 100)}
                        %
                      </small>
                    )}

                  {activity.type === "video_emotion" &&
                    activity.confidence !== undefined && (
                      <small>
                        Video confidence:{" "}
                        {Math.round(activity.confidence * 100)}%
                      </small>
                    )}
                </div>

                <div className="activity-meta">
                  {activity.intensity !== undefined && (
                    <span>Intensity {activity.intensity}/10</span>
                  )}

                  {activity.stressLevel !== undefined && (
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
              Your recent Sukoon activity will appear here as you use the
              platform.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default EmotionInsights;
