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
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import SomaticStress from "./pages/SomaticStress";
import ShiftCheckin from "./pages/ShiftCheckin";
import PostShiftDecompression from "./pages/PostShiftDecompression";

function App() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

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
            <NavLink to="/somatic-stress" className="nav-item">
              🧍 Somatic Stress Map
            </NavLink>
            <p className="nav-heading">ANALYZE</p>

            <NavLink to="/emotion-insights" className="nav-item">
              📊 Emotion Insights
            </NavLink>

            <NavLink to="/phq4" className="nav-item">
              📝 PHQ-4 Assessment
            </NavLink>

            <NavLink to="/shift-checkin" className="nav-item">
              ⏰ Shift Check-in
            </NavLink>

            <p className="nav-heading">SUPPORT</p>

            <NavLink to="/interventions" className="nav-item">
              🧘 Interventions
            </NavLink>

            <NavLink to="/post-shift-decompression" className="nav-item">
              🛌 Post-Shift Decompression
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
            <button className="nav-item logout-button" onClick={handleLogout}>
              🚪 Logout
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            {/* Public Routes */}

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/mood-checkin"
              element={
                <ProtectedRoute>
                  <MoodCheckin />
                </ProtectedRoute>
              }
            />

            <Route
              path="/emotional-granularity"
              element={
                <ProtectedRoute>
                  <EmotionalGranularity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/somatic-stress"
              element={
                <ProtectedRoute>
                  <SomaticStress />
                </ProtectedRoute>
              }
            />

            <Route
              path="/emotion-insights"
              element={
                <ProtectedRoute>
                  <EmotionInsights />
                </ProtectedRoute>
              }
            />

            <Route
              path="/shift-checkin"
              element={
                <ProtectedRoute>
                  <ShiftCheckin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/post-shift-decompression"
              element={
                <ProtectedRoute>
                  <PostShiftDecompression />
                </ProtectedRoute>
              }
            />
            <Route
              path="/phq4"
              element={
                <ProtectedRoute>
                  <PHQ4Assessment />
                </ProtectedRoute>
              }
            />

            <Route
              path="/journal"
              element={
                <ProtectedRoute>
                  <Journal />
                </ProtectedRoute>
              }
            />

            <Route
              path="/chatbot"
              element={
                <ProtectedRoute>
                  <Chatbot />
                </ProtectedRoute>
              }
            />

            <Route
              path="/interventions"
              element={
                <ProtectedRoute>
                  <Interventions />
                </ProtectedRoute>
              }
            />

            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
