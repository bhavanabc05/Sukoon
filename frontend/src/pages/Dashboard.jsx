import { Link } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <section className="welcome-section">
        <div>
          <p className="welcome-label">WELCOME TO SUKOON</p>
          <h1>How are you feeling today?</h1>
          <p>
            Take a moment to understand your emotional wellbeing and get
            personalized support.
          </p>
        </div>

        <div className="date-card">
          <span>📅</span>
          <div>
            <strong>Today's Wellbeing</strong>
            <p>Start with a quick check-in</p>
          </div>
        </div>
      </section>

      {/* Quick Check-in */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Quick Check-in</h2>
            <p>Understand what you're feeling right now.</p>
          </div>
        </div>

        <div className="quick-checkin-grid">
          <Link to="/mood-checkin" className="quick-card">
            <div className="quick-icon">😊</div>
            <h3>Mood Check-in</h3>
            <p>Record your current mood and intensity.</p>
            <span>Check in →</span>
          </Link>

          <Link to="/emotional-granularity" className="quick-card">
            <div className="quick-icon">🎨</div>
            <h3>Emotional Granularity</h3>
            <p>Identify and describe your emotions more precisely.</p>
            <span>Explore emotions →</span>
          </Link>

          <Link to="/somatic-stress" className="quick-card">
            <div className="quick-icon">🧍</div>
            <h3>Somatic Stress Map</h3>
            <p>Notice where stress and tension appear in your body.</p>
            <span>Map stress →</span>
          </Link>
        </div>
      </section>

      {/* Current Emotional State */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Current Emotional State</h2>
            <p>Based on your latest wellbeing inputs.</p>
          </div>
        </div>

        <div className="emotion-overview">
          <div className="emotion-card primary-emotion">
            <p className="card-label">CURRENT STATE</p>
            <div className="emotion-display">
              <span className="emotion-emoji">😟</span>

              <div>
                <h2>Stressed</h2>
                <p>Intensity: 7 / 10</p>
              </div>
            </div>
          </div>

          <div className="emotion-card">
            <p className="card-label">EMOTIONAL TREND</p>
            <h2>Stable</h2>
            <p>Your emotional state has remained relatively consistent.</p>
          </div>

          <div className="emotion-card">
            <p className="card-label">MULTIMODAL ANALYSIS</p>
            <h2>Coming Soon</h2>
            <p>Text, audio and facial emotion analysis will appear here.</p>
          </div>
        </div>
      </section>

      {/* Recommended Support */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Recommended for You</h2>
            <p>Personalized support based on your current emotional state.</p>
          </div>

          <Link to="/interventions" className="view-all">
            View all →
          </Link>
        </div>

        <div className="recommendation-grid">
          <div className="recommendation-card">
            <div className="recommendation-icon">🫁</div>
            <div>
              <h3>Box Breathing</h3>
              <p>A short breathing exercise to help reduce stress.</p>
              <span>2 minutes</span>
            </div>
          </div>

          <div className="recommendation-card">
            <div className="recommendation-icon">🌿</div>
            <div>
              <h3>Grounding Exercise</h3>
              <p>Reconnect with the present moment.</p>
              <span>5 minutes</span>
            </div>
          </div>

          <div className="recommendation-card">
            <div className="recommendation-icon">📔</div>
            <div>
              <h3>Reflect in Journal</h3>
              <p>Write down what has been on your mind.</p>
              <span>Reflect</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Recent Wellbeing Activity</h2>
            <p>Your latest interactions with Sukoon.</p>
          </div>
        </div>

        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">😊</div>
            <div>
              <h3>Mood Check-in</h3>
              <p>You recorded feeling overwhelmed.</p>
            </div>
            <span>Today</span>
          </div>

          <div className="activity-item">
            <div className="activity-icon">📔</div>
            <div>
              <h3>Journal Entry</h3>
              <p>You reflected on a demanding shift.</p>
            </div>
            <span>Yesterday</span>
          </div>

          <div className="activity-item">
            <div className="activity-icon">🏥</div>
            <div>
              <h3>Shift Check-in</h3>
              <p>Post-shift wellbeing check completed.</p>
            </div>
            <span>2 days ago</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
