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

function getActivityDetails(activity) {
  switch (activity.type) {
    case "mood":
      return {
        icon: "😊",
        title: activity.label || "Mood Check-in",
        detail: activity.emotion
          ? `Mood: ${activity.emotion} · Intensity: ${
              activity.intensity ?? "—"
            }/10`
          : "Mood recorded",
      };

    case "emotional_granularity":
      return {
        icon: "🎨",
        title: activity.label || "Emotional Granularity",
        detail: activity.emotion
          ? `Emotion: ${activity.emotion} · Intensity: ${
              activity.intensity ?? "—"
            }/10`
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
            activity.emotion ? `Mood: ${activity.emotion}` : null,
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
            activity.emotion ? `Mood: ${activity.emotion}` : null,
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
          ? `Emotion: ${activity.emotion}${
              activity.intensity !== undefined
                ? ` · Intensity: ${activity.intensity}/10`
                : ""
            }`
          : "Journal entry added",
      };

    default:
      return {
        icon: "✨",
        title: activity.label || "Wellbeing Activity",
        detail: "Wellbeing activity recorded",
      };
  }
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
  const recentActivity = insights?.recentActivity || [];

  const topEmotions = emotions.frequentSpecificEmotions?.slice(0, 3) || [];

  const latestActivity = recentActivity.slice(0, 5);
  const totalActivity = recentActivity.length;

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

            <Link to="/text-emotion" className="hero-secondary-button">
              Explore your emotions
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
              <span className="action-label">UNDERSTAND</span>
              <h3>Text Emotion</h3>
              <p>Put your thoughts into words and explore the emotion.</p>
            </div>

            <span className="card-arrow">→</span>
          </Link>

          <Link to="/journal" className="quick-action-card">
            <div className="quick-action-icon journal-icon">📔</div>

            <div className="quick-action-content">
              <span className="action-label">REFLECT</span>
              <h3>Journal</h3>
              <p>Create a private space for your thoughts.</p>
            </div>

            <span className="card-arrow">→</span>
          </Link>

          <Link to="/interventions" className="quick-action-card">
            <div className="quick-action-icon intervention-icon">🧘</div>

            <div className="quick-action-content">
              <span className="action-label">RESET</span>
              <h3>Interventions</h3>
              <p>Try a simple wellbeing activity.</p>
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
          {/* MOOD */}
          <div className="overview-card mood-card">
            <div className="overview-card-top">
              <span className="overview-icon">😊</span>
              <span className="overview-label">RECENT MOOD</span>
            </div>

            {mood.mostFrequent ? (
              <>
                <h3 className="overview-value">{mood.mostFrequent}</h3>

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

          {/* STRESS */}
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

          {/* ACTIVITY */}
          <div className="overview-card activity-card">
            <div className="overview-card-top">
              <span className="overview-icon">✨</span>
              <span className="overview-label">ACTIVITY</span>
            </div>

            <h3 className="overview-value">{totalActivity}</h3>

            <p>Recent wellbeing interactions</p>
          </div>

          {/* EMOTIONS */}
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
                    {item.emotion}
                  </span>
                ))}
              </div>
            ) : (
              <h3 className="overview-value muted-value">Getting started</h3>
            )}

            <p>Your frequently identified emotions</p>
          </div>
        </div>
      </section>

      {/* TEXT EMOTION FEATURE */}
      <section className="text-emotion-banner">
        <div className="text-emotion-banner-icon">💭</div>

        <div className="text-emotion-banner-content">
          <p className="section-eyebrow">EXPLORE YOUR WORDS</p>

          <h2>What might your words be expressing?</h2>

          <p>
            Write a few lines about how you're feeling and explore the emotion
            expressed through your words.
          </p>
        </div>

        <Link to="/text-emotion" className="text-emotion-banner-button">
          Analyze emotion
          <span>→</span>
        </Link>
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
                <span>{item.emotion}</span>
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
        </div>

        {latestActivity.length > 0 ? (
          <div className="activity-list">
            {latestActivity.map((activity, index) => {
              const details = getActivityDetails(activity);

              return (
                <div
                  className="activity-item"
                  key={activity._id || `${activity.type}-${index}`}
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

      {/* SUPPORT */}
      <section className="support-section">
        <div className="support-content">
          <p className="section-eyebrow">SUPPORT</p>

          <h2>Need a little support?</h2>

          <p>Explore tools, resources, or conversation when you need them.</p>
        </div>

        <div className="support-actions">
          <Link to="/chatbot" className="support-link">
            <span className="support-link-icon">💬</span>

            <div>
              <strong>Sukoon Chat</strong>
              <small>Talk it through</small>
            </div>

            <span className="support-arrow">→</span>
          </Link>

          <Link to="/resource-hub" className="support-link">
            <span className="support-link-icon">📚</span>

            <div>
              <strong>Resource Hub</strong>
              <small>Explore resources</small>
            </div>

            <span className="support-arrow">→</span>
          </Link>

          <Link to="/professional-support" className="support-link">
            <span className="support-link-icon">👩‍⚕️</span>

            <div>
              <strong>Professional Support</strong>
              <small>Find support options</small>
            </div>

            <span className="support-arrow">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
