import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import "./App.css";

import Dashboard from "./pages/Dashboard";
import MoodCheckin from "./pages/MoodCheckin";
import EmotionInsights from "./pages/EmotionInsights";
import PHQ4Assessment from "./pages/PHQ4Assessment";
import Journal from "./pages/Journal";
import Chatbot from "./pages/Chatbot";
import Interventions from "./pages/Interventions";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import EmotionalGranularity from "./pages/EmotionalGranularity";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="logo">
            <h1>Sukoon</h1>
            <p>Wellbeing Platform</p>
          </div>

          <nav className="nav-menu">
            <NavLink to="/" className="nav-item">
              🏠 Dashboard
            </NavLink>

            <p className="nav-heading">UNDERSTAND</p>

            <NavLink to="/mood-checkin" className="nav-item">
              😊 Mood Check-in
            </NavLink>

            <NavLink to="/emotional-granularity" className="nav-item">
              🎨 Emotional Granularity
            </NavLink>
            <button className="nav-item">💬 Text Emotion</button>

            <button className="nav-item">🎤 Audio Emotion</button>

            <button className="nav-item">📷 Facial / Video Emotion</button>

            <button className="nav-item">🧍 Somatic Stress Map</button>

            <p className="nav-heading">ANALYZE</p>

            <NavLink to="/emotion-insights" className="nav-item">
              📊 Emotion Insights
            </NavLink>

            <NavLink to="/phq4" className="nav-item">
              📝 PHQ-4 Assessment
            </NavLink>

            <button className="nav-item">🏥 Shift Check-in</button>

            <p className="nav-heading">SUPPORT</p>

            <NavLink to="/interventions" className="nav-item">
              🧘 Interventions
            </NavLink>

            <NavLink to="/chatbot" className="nav-item">
              🤖 Sukoon Chat
            </NavLink>

            <NavLink to="/journal" className="nav-item">
              📔 Journal
            </NavLink>

            <NavLink to="/community" className="nav-item">
              👥 Community
            </NavLink>

            <button className="nav-item">🎯 Challenges</button>

            <button className="nav-item">🔔 Reminders</button>

            <button className="nav-item">📚 Resource Hub</button>

            <button className="nav-item">🩺 Professional Support</button>

            <p className="nav-heading">ACCOUNT</p>

            <NavLink to="/profile" className="nav-item">
              👤 Profile
            </NavLink>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mood-checkin" element={<MoodCheckin />} />
            <Route
              path="/emotional-granularity"
              element={<EmotionalGranularity />}
            />
            <Route path="/emotion-insights" element={<EmotionInsights />} />
            <Route path="/phq4" element={<PHQ4Assessment />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/interventions" element={<Interventions />} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
