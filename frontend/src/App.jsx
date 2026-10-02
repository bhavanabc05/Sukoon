import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import "./App.css";

import Dashboard from "./pages/Dashboard";
import MoodCheckin from "./pages/MoodCheckin";
import EmotionInsights from "./pages/EmotionInsights";
import PHQ4Assessment from "./pages/PHQ4Assessment";
import Journal from "./pages/Journal";
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
import Reminders from "./pages/Reminders";
import SukoonChat from "./pages/SukoonChat";
import Challenges from "./pages/Challenges";
import ChallengeDetails from "./pages/ChallengeDetails";
import ReminderNotification from "./components/ReminderNotification";
import ResourceHub from "./pages/ResourceHub";
import ResourceDetails from "./pages/ResourceDetails";
import ResourceManagement from "./pages/ResourceManagement";
import ProfessionalSupport from "./pages/ProfessionalSupport";

import TextEmotion from "./pages/TextEmotion";
import AudioEmotion from "./pages/AudioEmotion";
import VideoEmotion from "./pages/VideoEmotion";

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

            <NavLink to="/shift-checkin" className="nav-item">
              ⏰ Shift Check-in
            </NavLink>

            <NavLink to="/emotional-granularity" className="nav-item">
              🎨 Emotional Granularity
            </NavLink>
            <NavLink to="/somatic-stress" className="nav-item">
              🧍 Somatic Stress Map
            </NavLink>
            <NavLink to="/text-emotion" className="nav-item">
              ✍️ Text Emotion
            </NavLink>
            <NavLink to="/audio-emotion" className="nav-item">
              🎤 Audio Emotion
            </NavLink>
            <NavLink to="/video-emotion" className="nav-item">
              🎥 Video Emotion
            </NavLink>

            <p className="nav-heading">ANALYZE</p>

            <NavLink to="/emotion-insights" className="nav-item">
              📊 Emotion Insights
            </NavLink>

            <NavLink to="/phq4" className="nav-item">
              📝 PHQ-4 Assessment
            </NavLink>

            <p className="nav-heading">PERSONALIZE</p>

            <NavLink to="/journal" className="nav-item">
              📔 Journal
            </NavLink>

            <NavLink to="/reminders" className="nav-item">
              ⏱️ Reminders
            </NavLink>

            <p className="nav-heading">SUPPORT</p>

            <NavLink to="/sukoon-chat" className="nav-item">
              🤖 Sukoon Chat
            </NavLink>
            <NavLink to="/resource-hub" className="nav-item">
              📚 Resource Hub
            </NavLink>
            <NavLink to="/interventions" className="nav-item">
              🧘 Interventions
            </NavLink>
            <NavLink to="/post-shift-decompression" className="nav-item">
              🛌 Post-Shift Decompression
            </NavLink>
            <NavLink to="/professional-support" className="nav-item">
              🏥 Professional Support
            </NavLink>

            <NavLink to="/community" className="nav-item">
              👥 Community
            </NavLink>

            <NavLink to="/challenges" className="nav-item">
              🏆 Challenges
            </NavLink>

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
                  <SukoonChat />
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
              path="/reminders"
              element={
                <ProtectedRoute>
                  <Reminders />
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
            <Route
              path="/text-emotion"
              element={
                <ProtectedRoute>
                  <TextEmotion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audio-emotion"
              element={
                <ProtectedRoute>
                  <AudioEmotion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/video-emotion"
              element={
                <ProtectedRoute>
                  <VideoEmotion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sukoon-chat"
              element={
                <ProtectedRoute>
                  <SukoonChat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/challenges"
              element={
                <ProtectedRoute>
                  <Challenges />
                </ProtectedRoute>
              }
            />
            <Route
              path="/challenges/:challengeId"
              element={
                <ProtectedRoute>
                  <ChallengeDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resource-hub"
              element={
                <ProtectedRoute>
                  <ResourceHub />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resources/:resourceId"
              element={
                <ProtectedRoute>
                  <ResourceDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resource-management"
              element={
                <ProtectedRoute>
                  <ResourceManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/professional-support"
              element={
                <ProtectedRoute>
                  <ProfessionalSupport />
                </ProtectedRoute>
              }
            />
          </Routes>
          <ReminderNotification />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
