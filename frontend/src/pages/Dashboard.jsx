import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../utils/api";
import "./Dashboard.css";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatRelativeDate(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const difference = (startOfToday - startOfDate) / (1000 * 60 * 60 * 24);

  if (difference === 0) return "Today";
  if (difference === 1) return "Yesterday";

  if (difference > 1 && difference < 7) {
    return `${Math.floor(difference)} days ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatReminderTime(time) {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);

  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

function formatReminderSchedule(reminder) {
  if (reminder.scheduleType === "fixed") {
    return reminder.time ? formatReminderTime(reminder.time) : "Scheduled";
  }

  if (reminder.scheduleType === "interval") {
    const minutes = reminder.intervalMinutes || 0;

    let intervalText = "";

    if (minutes % 60 === 0) {
      const hours = minutes / 60;
      intervalText = `Every ${hours} hour${hours !== 1 ? "s" : ""}`;
    } else {
      intervalText = `Every ${minutes} minutes`;
    }

    if (reminder.startTime && reminder.endTime) {
      return `${intervalText} · ${formatReminderTime(
        reminder.startTime,
      )}–${formatReminderTime(reminder.endTime)}`;
    }

    return intervalText;
  }

  return "Scheduled";
}

function formatEmotion(emotion) {
  if (!emotion) return "—";

  return emotion
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getActivityDetails(activity) {
  switch (activity.type) {
    case "mood":
      return {
        icon: "😊",
        title: activity.label || "Mood Check-in",
        detail: activity.emotion
          ? `Mood: ${formatEmotion(
              activity.emotion,
            )} · Intensity: ${activity.intensity ?? "—"}/10`
          : "Mood recorded",
      };

    case "emotional_granularity":
      return {
        icon: "🎨",
        title: activity.label || "Emotional Granularity",
        detail: activity.emotion
          ? `Emotion: ${formatEmotion(
              activity.emotion,
            )} · Intensity: ${activity.intensity ?? "—"}/10`
          : "Emotion identified",
      };

    case "somatic_stress":
      return {
        icon: "🧍",
        title: activity.label || "Somatic Stress Map",
        detail:
          activity.intensity !== undefined
            ? `Stress level: ${activity.intensity}/10`
            : "Body stress recorded",
      };

    case "shift_checkin":
      return {
        icon: "⏰",
        title: activity.label || "Shift Check-in",
        detail:
          [
            activity.emotion
              ? `Mood: ${formatEmotion(activity.emotion)}`
              : null,
            activity.stressLevel !== undefined
              ? `Stress: ${activity.stressLevel}/10`
              : null,
          ]
            .filter(Boolean)
            .join(" · ") || "Shift wellbeing recorded",
      };

    case "post_shift":
      return {
        icon: "🌙",
        title: activity.label || "Post-Shift Decompression",
        detail:
          [
            activity.emotion
              ? `Mood: ${formatEmotion(activity.emotion)}`
              : null,
            activity.stressLevel !== undefined
              ? `Stress: ${activity.stressLevel}/10`
              : null,
          ]
            .filter(Boolean)
            .join(" · ") || "Post-shift recovery recorded",
      };

    case "journal":
      return {
        icon: "📔",
        title: activity.label || "Journal",
        detail: activity.emotion
          ? `Emotion: ${formatEmotion(activity.emotion)}${
              activity.intensity !== undefined
                ? ` · Intensity: ${activity.intensity}/10`
                : ""
            }`
          : "Journal entry added",
      };

    case "text_emotion":
      return {
        icon: "💬",
        title: activity.label || "Text Emotion",
        detail: activity.emotion
          ? `${formatEmotion(activity.emotion)} detected from text`
          : "Text emotion analyzed",
      };

    case "audio_emotion":
      return {
        icon: "🎙️",
        title: activity.label || "Voice Emotion",
        detail: activity.emotion
          ? `${formatEmotion(activity.emotion)} detected from voice`
          : "Voice emotion analyzed",
      };

    case "video_emotion":
      return {
        icon: "🎥",
        title: activity.label || "Video Emotion",
        detail: activity.emotion
          ? `${formatEmotion(activity.emotion)} detected from video`
          : "Video emotion analyzed",
      };

    case "guided_reflection":
      return {
        icon: "🧘",
        title: activity.label || "Guided Reflection",
        detail: activity.emotion
          ? `${formatEmotion(activity.emotion)} recorded during reflection`
          : "Guided reflection completed",
      };

    case "phq4":
      return {
        icon: "📋",
        title: activity.label || "PHQ-4 Assessment",
        detail: "PHQ-4 assessment completed",
      };

    case "challenge":
      return {
        icon: "🏆",
        title: activity.label || "Challenge Activity",
        detail: activity.day
          ? `Day ${activity.day} completed`
          : "Challenge task completed",
      };

    default:
      return {
        icon: "✨",
        title: activity.label || "Wellbeing Activity",
        detail: "Wellbeing activity recorded",
      };
  }
}

function DashboardTrend({ data = [] }) {
  if (!data.length) {
    return (
      <div className="dashboard-trend-empty">
        <span>📈</span>
        <p>Record more wellbeing activities to see your emotional trend.</p>
      </div>
    );
  }

  const width = 760;
  const height = 240;

  const padding = {
    top: 20,
    right: 20,
    bottom: 42,
    left: 42,
  };

  const chartWidth = width - padding.left - padding.right;

  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map((item) => Number(item.averageIntensity) || 0);

  const maxValue = Math.max(...values, 10);

  const getX = (index) => {
    if (data.length === 1) {
      return padding.left + chartWidth / 2;
    }

    return padding.left + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (value) => {
    return padding.top + chartHeight - (value / maxValue) * chartHeight;
  };

  const points = data
    .map(
      (item, index) =>
        `${getX(index)},${getY(Number(item.averageIntensity) || 0)}`,
    )
    .join(" ");

  const labelIndexes =
    data.length <= 5
      ? data.map((_, index) => index)
      : [0, Math.floor(data.length / 2), data.length - 1];

  return (
    <div className="dashboard-trend-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="dashboard-trend-svg"
        role="img"
        aria-label="Emotional intensity trend"
      >
        {[0, 2.5, 5, 7.5, 10].map((value) => {
          const y = getY(value);

          return (
            <g key={value}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                className="dashboard-chart-grid"
              />

              <text
                x={padding.left - 9}
                y={y + 4}
                textAnchor="end"
                className="dashboard-chart-label"
              >
                {value}
              </text>
            </g>
          );
        })}

        <polyline
          points={points}
          fill="none"
          className="dashboard-trend-line"
        />

        {data.map((item, index) => (
          <circle
            key={`${item.date}-${index}`}
            cx={getX(index)}
            cy={getY(Number(item.averageIntensity) || 0)}
            r="4"
            className="dashboard-trend-point"
          />
        ))}

        {labelIndexes.map((index) => {
          const item = data[index];

          return (
            <text
              key={`${item.date}-label`}
              x={getX(index)}
              y={height - 12}
              textAnchor="middle"
              className="dashboard-chart-label"
            >
              {new Date(`${item.date}T00:00:00`).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function Dashboard() {
  const [insights, setInsights] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [insightsResponse, remindersResponse] = await Promise.all([
        apiFetch("/api/emotion-insights"),
        apiFetch("/api/reminders"),
      ]);

      if (!insightsResponse || !remindersResponse) {
        return;
      }

      const insightsData = await insightsResponse.json();

      const remindersData = await remindersResponse.json();

      if (!insightsResponse.ok) {
        throw new Error(
          insightsData.message || "Unable to load wellbeing insights.",
        );
      }

      if (!remindersResponse.ok) {
        throw new Error(remindersData.message || "Unable to load reminders.");
      }

      setInsights(insightsData);

      setReminders(
        (remindersData.reminders || []).filter(
          (reminder) => reminder.status === "active",
        ),
      );
    } catch (error) {
      console.error("Dashboard error:", error);
      setError(error.message || "Unable to load your dashboard right now.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your wellbeing overview...</p>
        </div>
      </div>
    );
  }

  const summary = insights?.summary || {};
  const mood = insights?.mood || {};
  const emotions = insights?.emotions || {};
  const stress = insights?.stress || {};
  const trends = insights?.trends || {};
  const recentActivity = insights?.recentActivity || [];

  const topEmotions = emotions.frequentSpecificEmotions?.slice(0, 3) || [];

  const latestActivity = recentActivity.slice(0, 6);

  return (
    <div className="dashboard">
      {/* HERO */}
      <section className="dashboard-hero">
        <div className="hero-main">
          <p className="hero-eyebrow">YOUR SUKOON SPACE</p>

          <h1>
            {getGreeting()} <span>👋</span>
          </h1>

          <p className="hero-description">
            Take a moment to notice how you're doing. Here's a gentle overview
            of your wellbeing journey.
          </p>

          <div className="hero-actions">
            <Link to="/mood-checkin" className="hero-primary-button">
              Check in with yourself
              <span>→</span>
            </Link>

            <Link to="/emotion-insights" className="hero-secondary-button">
              View your insights
            </Link>
          </div>
        </div>

        <div className="hero-date-card">
          <span className="hero-date-icon">📅</span>

          <div>
            <span>TODAY</span>
            <strong>{formatDate()}</strong>
          </div>
        </div>
      </section>

      {error && (
        <div className="dashboard-error">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* QUICK ACTIONS */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">START HERE</p>

            <h2>What would help right now?</h2>

            <p>Choose a small step that feels right for you.</p>
          </div>
        </div>

        <div className="quick-action-grid">
          <Link to="/mood-checkin" className="quick-action-card">
            <div className="quick-action-icon mood-icon">😊</div>

            <div className="quick-action-content">
              <span className="action-label">CHECK IN</span>

              <h3>Mood Check-in</h3>

              <p>Notice how you're feeling right now.</p>
            </div>

            <span className="card-arrow">→</span>
          </Link>

          <Link to="/text-emotion" className="quick-action-card">
            <div className="quick-action-icon text-emotion-icon">💭</div>

            <div className="quick-action-content">
              <span className="action-label">TEXT</span>

              <h3>Text Emotion</h3>

              <p>Explore the emotion expressed through your words.</p>
            </div>

            <span className="card-arrow">→</span>
          </Link>

          <Link to="/audio-emotion" className="quick-action-card">
            <div className="quick-action-icon audio-emotion-icon">🎙️</div>

            <div className="quick-action-content">
              <span className="action-label">VOICE</span>

              <h3>Audio Emotion</h3>

              <p>Explore emotional signals detected in your voice.</p>
            </div>

            <span className="card-arrow">→</span>
          </Link>

          <Link to="/video-emotion" className="quick-action-card">
            <div className="quick-action-icon video-emotion-icon">🎥</div>

            <div className="quick-action-content">
              <span className="action-label">VIDEO</span>

              <h3>Video Emotion</h3>

              <p>Explore facial emotion patterns from video.</p>
            </div>

            <span className="card-arrow">→</span>
          </Link>
        </div>
      </section>

      {/* WELLBEING SNAPSHOT */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">YOUR WELLBEING</p>

            <h2>A quick snapshot</h2>

            <p>Based on your recent activity with Sukoon.</p>
          </div>

          <Link to="/emotion-insights" className="view-all">
            View insights →
          </Link>
        </div>

        <div className="overview-grid">
          <div className="overview-card mood-card">
            <div className="overview-card-top">
              <span className="overview-icon">😊</span>

              <span className="overview-label">RECENT MOOD</span>
            </div>

            {mood.mostFrequent ? (
              <>
                <h3 className="overview-value">
                  {formatEmotion(mood.mostFrequent)}
                </h3>

                {mood.averageIntensity !== null &&
                  mood.averageIntensity !== undefined && (
                    <p>
                      Average intensity{" "}
                      <strong>
                        {Number(mood.averageIntensity).toFixed(1)}
                      </strong>
                      /10
                    </p>
                  )}
              </>
            ) : (
              <>
                <h3 className="overview-value muted-value">No check-in yet</h3>

                <p>Your first check-in will appear here.</p>
              </>
            )}
          </div>

          <div className="overview-card stress-card">
            <div className="overview-card-top">
              <span className="overview-icon">🧍</span>

              <span className="overview-label">BODY STRESS</span>
            </div>

            {stress.averageSomaticStress !== null &&
            stress.averageSomaticStress !== undefined ? (
              <>
                <h3 className="overview-value">
                  {Number(stress.averageSomaticStress).toFixed(1)}
                  <span className="value-suffix"> / 10</span>
                </h3>

                <p>Average recorded somatic stress</p>
              </>
            ) : (
              <>
                <h3 className="overview-value muted-value">No data yet</h3>

                <p>Complete a Somatic Stress Map to begin.</p>
              </>
            )}
          </div>

          <div className="overview-card activity-card">
            <div className="overview-card-top">
              <span className="overview-icon">✨</span>

              <span className="overview-label">TOTAL ACTIVITY</span>
            </div>

            <h3 className="overview-value">{summary.totalActivities || 0}</h3>

            <p>Recorded wellbeing activities</p>
          </div>

          <div className="overview-card emotion-card">
            <div className="overview-card-top">
              <span className="overview-icon">🎨</span>

              <span className="overview-label">EMOTIONAL AWARENESS</span>
            </div>

            {topEmotions.length > 0 ? (
              <div className="snapshot-emotions">
                {topEmotions.map((item, index) => (
                  <span
                    className="snapshot-emotion"
                    key={`${item.emotion}-${index}`}
                  >
                    {formatEmotion(item.emotion)}
                  </span>
                ))}
              </div>
            ) : (
              <h3 className="overview-value muted-value">Getting started</h3>
            )}

            <p>Frequently identified emotions</p>
          </div>
        </div>
      </section>

      {/* EMOTIONAL TREND */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">YOUR PATTERNS</p>

            <h2>Emotional trend</h2>

            <p>
              A compact view of how recorded emotional intensity has changed
              over time.
            </p>
          </div>

          <Link to="/emotion-insights" className="view-all">
            View full insights →
          </Link>
        </div>

        <div className="dashboard-trend-card">
          <DashboardTrend data={trends.emotionalIntensity} />

          <div className="dashboard-trend-footer">
            <span>
              Average intensity is based only on activities where an actual
              intensity was recorded.
            </span>

            <Link to="/emotion-insights">Explore patterns →</Link>
          </div>
        </div>
      </section>

      {/* ALL WELLBEING TOOLS */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">WELLBEING TOOLS</p>

            <h2>Explore Sukoon</h2>

            <p>All your wellbeing tools are available directly from here.</p>
          </div>
        </div>

        <div className="dashboard-tools-grid">
          <Link to="/shift-checkin" className="dashboard-tool-card">
            <span>⏰</span>
            <div>
              <strong>Shift Check-in</strong>
              <small>Check in around your work shift</small>
            </div>
          </Link>

          <Link to="/emotional-granularity" className="dashboard-tool-card">
            <span>🎨</span>
            <div>
              <strong>Emotional Granularity</strong>
              <small>Understand emotions more precisely</small>
            </div>
          </Link>

          <Link to="/somatic-stress" className="dashboard-tool-card">
            <span>🧍</span>
            <div>
              <strong>Somatic Stress</strong>
              <small>Notice stress through body signals</small>
            </div>
          </Link>

          <Link to="/post-shift-decompression" className="dashboard-tool-card">
            <span>🌙</span>
            <div>
              <strong>Post-Shift Decompression</strong>
              <small>Create space to recover after work</small>
            </div>
          </Link>

          <Link to="/journal" className="dashboard-tool-card">
            <span>📔</span>
            <div>
              <strong>Journal</strong>
              <small>Reflect privately on your day</small>
            </div>
          </Link>

          <Link to="/phq4" className="dashboard-tool-card">
            <span>📋</span>
            <div>
              <strong>PHQ-4</strong>
              <small>Complete a brief wellbeing screening</small>
            </div>
          </Link>

          <Link to="/sukoon-chat" className="dashboard-tool-card">
            <span>🧘</span>
            <div>
              <strong>Sukoon Chat</strong>
              <small>Reflect with structured prompts</small>
            </div>
          </Link>

          <Link to="/reminders" className="dashboard-tool-card">
            <span>🔔</span>
            <div>
              <strong>Reminders</strong>
              <small>Build gentle wellbeing routines</small>
            </div>
          </Link>

          <Link to="/interventions" className="dashboard-tool-card">
            <span>🌿</span>
            <div>
              <strong>Interventions</strong>
              <small>Try a guided wellbeing activity</small>
            </div>
          </Link>
        </div>
      </section>

      {/* RECENT EMOTIONS */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">UNDERSTAND</p>

            <h2>Recent Emotions</h2>

            <p>Emotions you've identified through Sukoon.</p>
          </div>

          <Link to="/emotional-granularity" className="view-all">
            Explore emotions →
          </Link>
        </div>

        {topEmotions.length > 0 ? (
          <div className="emotion-tags">
            {topEmotions.map((item, index) => (
              <div className="emotion-tag" key={`${item.emotion}-${index}`}>
                <span>{formatEmotion(item.emotion)}</span>

                <strong>
                  {item.count} {item.count === 1 ? "record" : "records"}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-card">
            <span>🎨</span>

            <div>
              <h3>No emotions recorded yet</h3>

              <p>
                Explore Emotional Granularity to describe what you're feeling
                more precisely.
              </p>
            </div>

            <Link to="/emotional-granularity">Explore →</Link>
          </div>
        )}
      </section>

      {/* TODAY'S ROUTINE */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">PERSONALIZE</p>

            <h2>Today's Routine</h2>

            <p>Your active wellbeing reminders.</p>
          </div>

          <Link to="/reminders" className="view-all">
            Manage reminders →
          </Link>
        </div>

        {reminders.length > 0 ? (
          <div className="routine-list">
            {reminders.slice(0, 5).map((reminder) => {
              const typeIcons = {
                hydration: "💧",
                sun_break: "☀️",
                movement: "🚶",
                breathing: "🧘",
                mood_checkin: "😊",
                journal: "📔",
                custom: "✨",
              };

              return (
                <div className="routine-item" key={reminder._id}>
                  <div className="routine-icon">
                    {typeIcons[reminder.reminderType] || "✨"}
                  </div>

                  <div className="routine-info">
                    <h3>{reminder.title}</h3>

                    <p>{formatReminderSchedule(reminder)}</p>
                  </div>

                  <span className="routine-status">Active</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="dashboard-empty-card">
            <span>🔔</span>

            <div>
              <h3>No active reminders</h3>

              <p>
                Set up reminders to build gentle wellbeing habits throughout
                your day.
              </p>
            </div>

            <Link to="/reminders">Set reminders →</Link>
          </div>
        )}
      </section>

      {/* RECENT ACTIVITY */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">YOUR JOURNEY</p>

            <h2>Recent Activity</h2>

            <p>Your latest interactions with Sukoon.</p>
          </div>

          <Link to="/emotion-insights" className="view-all">
            View all insights →
          </Link>
        </div>

        {latestActivity.length > 0 ? (
          <div className="activity-list">
            {latestActivity.map((activity, index) => {
              const details = getActivityDetails(activity);

              return (
                <div
                  className="activity-item"
                  key={
                    activity._id ||
                    `${activity.type}-${activity.timestamp}-${index}`
                  }
                >
                  <div className="activity-icon">{details.icon}</div>

                  <div className="activity-content">
                    <h3>{details.title}</h3>

                    <p>{details.detail}</p>
                  </div>

                  <span className="activity-date">
                    {formatRelativeDate(
                      activity.timestamp ||
                        activity.createdAt ||
                        activity.checkInTime ||
                        activity.completedAt,
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="dashboard-empty-card">
            <span>🌱</span>

            <div>
              <h3>Your journey starts here</h3>

              <p>
                Your wellbeing activities will appear here as you use Sukoon.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* SUPPORT & COMMUNITY */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">CONNECT & SUPPORT</p>

            <h2>You're not alone</h2>

            <p>
              Explore conversation, resources, professional support, and
              community.
            </p>
          </div>
        </div>

        <div className="dashboard-support-grid">
          <Link to="/sukoon-chat" className="dashboard-support-card">
            <span>💬</span>

            <div>
              <strong>Sukoon Chat</strong>
              <small>Talk through what's on your mind</small>
            </div>

            <b>→</b>
          </Link>

          <Link to="/resource-hub" className="dashboard-support-card">
            <span>📚</span>

            <div>
              <strong>Resource Hub</strong>
              <small>Explore wellbeing resources</small>
            </div>

            <b>→</b>
          </Link>

          <Link to="/professional-support" className="dashboard-support-card">
            <span>👩‍⚕️</span>

            <div>
              <strong>Professional Support</strong>
              <small>Find support options</small>
            </div>

            <b>→</b>
          </Link>

          <Link to="/community" className="dashboard-support-card">
            <span>🤝</span>

            <div>
              <strong>Community</strong>
              <small>Connect through shared experiences</small>
            </div>

            <b>→</b>
          </Link>

          <Link to="/challenges" className="dashboard-support-card">
            <span>🏆</span>

            <div>
              <strong>Challenges</strong>
              <small>Build wellbeing habits together</small>
            </div>

            <b>→</b>
          </Link>

          <Link to="/profile" className="dashboard-support-card">
            <span>👤</span>

            <div>
              <strong>Profile</strong>
              <small>Manage your Sukoon profile</small>
            </div>

            <b>→</b>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
