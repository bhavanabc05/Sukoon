import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../utils/api";
import "./ChallengeDetails.css";

const taskTypeLabels = {
  custom: "Custom Task",
  mood: "Mood Check-in",
  journal: "Journal",
  guidedReflection: "Guided Reflection",
  stressAwareness: "Stress Awareness",
  shiftDecompression: "Shift Decompression",
};

const taskTypeInstructions = {
  mood: "Complete your Mood Check-in to complete this task.",
  journal: "Create a journal entry to complete this task.",
  guidedReflection: "Complete a Guided Reflection to complete this task.",
  stressAwareness: "Complete Somatic Stress Mapping to complete this task.",
  shiftDecompression:
    "Complete Post-Shift Decompression to complete this task.",
};

function ChallengeDetails() {
  const { challengeId } = useParams();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState(null);
  const [progress, setProgress] = useState(null);
  const [participants, setParticipants] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadChallenge();
  }, [challengeId]);

  const loadChallenge = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(`/api/challenges/${challengeId}`);

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load challenge.");
      }

      setChallenge(data.challenge || data);

      if (data.joined || data.isCreator) {
        await loadProgress();
        await loadParticipants();
      }
    } catch (err) {
      console.error("Challenge details error:", err);

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const response = await apiFetch(
        `/api/challenges/${challengeId}/progress`,
      );

      if (!response) return;

      const data = await response.json();

      if (response.ok) {
        setProgress(data);
      }
    } catch (err) {
      console.error("Progress loading error:", err);
    }
  };

  const loadParticipants = async () => {
    try {
      const response = await apiFetch(
        `/api/challenges/${challengeId}/participants`,
      );

      if (!response) return;

      const data = await response.json();

      if (response.ok) {
        setParticipants(data.participants || []);
      }
    } catch (err) {
      console.error("Participants loading error:", err);
    }
  };

  const handleJoin = async () => {
    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const response = await apiFetch(`/api/challenges/${challengeId}/join`, {
        method: "POST",
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to join challenge.");
      }

      setMessage("You joined the challenge successfully.");

      await loadChallenge();
    } catch (err) {
      console.error("Join error:", err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to leave this challenge?",
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const response = await apiFetch(`/api/challenges/${challengeId}/leave`, {
        method: "POST",
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to leave challenge.");
      }

      setMessage("You have left the challenge.");

      await loadChallenge();
    } catch (err) {
      console.error("Leave error:", err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTask = async (task) => {
    try {
      setTaskLoading(task._id);
      setError("");
      setMessage("");

      const response = await apiFetch(
        `/api/challenges/${challengeId}/tasks/${task._id}/complete`,
        {
          method: "POST",
        },
      );

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to complete task.");
      }

      setMessage("Task completed successfully.");

      await loadChallenge();
      await loadProgress();
      await loadParticipants();
    } catch (err) {
      console.error("Task completion error:", err);

      setError(err.message);
    } finally {
      setTaskLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="challenge-details-page">
        <div className="challenge-details-state">Loading challenge...</div>
      </div>
    );
  }

  if (error && !challenge) {
    return (
      <div className="challenge-details-page">
        <button className="back-button" onClick={() => navigate("/challenges")}>
          ← Back to Challenges
        </button>

        <div className="challenge-details-error">{error}</div>
      </div>
    );
  }

  if (!challenge) {
    return null;
  }

  const isJoined = challenge.joined;
  const isCreator = challenge.isCreator;

  const participation = challenge.participation || null;

  const completedDays = participation?.completedDays || [];

  const completionPercentage = participation?.completionPercentage || 0;

  const isCompleted = participation?.status === "completed";

  return (
    <div className="challenge-details-page">
      <button className="back-button" onClick={() => navigate("/challenges")}>
        ← Back to Challenges
      </button>

      {message && <div className="challenge-message">{message}</div>}

      {error && <div className="challenge-details-error">{error}</div>}

      <section className="challenge-hero">
        <div>
          <div className="challenge-detail-top">
            <span>{challenge.category}</span>

            <span>{challenge.status}</span>
          </div>

          <h1>{challenge.title}</h1>

          <p>{challenge.description}</p>

          <div className="challenge-info-row">
            <span>
              {challenge.duration} day
              {challenge.duration !== 1 ? "s" : ""}
            </span>

            <span>{challenge.participantCount || 0} participants</span>

            <span>Created by {challenge.creatorName || "User"}</span>
          </div>
        </div>

        <div className="challenge-action-area">
          {isCreator ? (
            <span className="creator-badge">Challenge Creator</span>
          ) : isJoined ? (
            <button
              className="leave-button"
              onClick={handleLeave}
              disabled={actionLoading}
            >
              {actionLoading ? "Leaving..." : "Leave Challenge"}
            </button>
          ) : (
            <button
              className="join-button"
              onClick={handleJoin}
              disabled={actionLoading}
            >
              {actionLoading ? "Joining..." : "Join Challenge"}
            </button>
          )}
        </div>
      </section>

      {isJoined && (
        <section className="personal-progress-card">
          <div>
            <h2>Your Progress</h2>

            <p>
              {isCompleted
                ? "Challenge completed!"
                : `${completedDays.length} of ${challenge.duration} days completed`}
            </p>
          </div>

          <div className="progress-value">{completionPercentage}%</div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${completionPercentage}%`,
              }}
            />
          </div>
        </section>
      )}

      {isJoined && (
        <section className="daily-tasks-section">
          <div className="section-heading">
            <h2>Daily Tasks</h2>
            <p>Complete each day's activity to move through the challenge.</p>
          </div>

          <div className="challenge-task-list">
            {challenge.tasks.map((task) => {
              const completed = completedDays.includes(task.day);

              const isCurrentDay = participation?.currentDay === task.day;

              const isAutomatic = task.taskType !== "custom";

              return (
                <div
                  className={`challenge-task-card ${
                    completed
                      ? "task-completed"
                      : isCurrentDay
                        ? "task-current"
                        : ""
                  }`}
                  key={task._id}
                >
                  <div className="task-day">Day {task.day}</div>

                  <div className="task-content">
                    <div className="task-heading">
                      <h3>{task.title}</h3>

                      {completed && (
                        <span className="completed-label">Completed</span>
                      )}
                    </div>

                    <p>{task.description}</p>

                    <span className="task-type">
                      {taskTypeLabels[task.taskType] || task.taskType}
                    </span>

                    {isAutomatic && !completed && (
                      <div className="automatic-task-message">
                        {taskTypeInstructions[task.taskType]}
                      </div>
                    )}

                    {task.taskType === "custom" &&
                      isCurrentDay &&
                      !completed && (
                        <button
                          className="complete-task-button"
                          onClick={() => handleCompleteTask(task)}
                          disabled={taskLoading === task._id}
                        >
                          {taskLoading === task._id
                            ? "Completing..."
                            : "Mark Complete"}
                        </button>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {isJoined && progress && (
        <section className="group-section">
          <div className="section-heading">
            <h2>Group Progress</h2>
            <p>See how the challenge group is progressing together.</p>
          </div>

          <div className="group-summary">
            <div className="group-stat">
              <strong>{progress.participantCount}</strong>
              <span>Participants</span>
            </div>

            <div className="group-stat">
              <strong>{progress.completedParticipants}</strong>
              <span>Completed</span>
            </div>

            <div className="group-stat">
              <strong>{progress.groupCompletionPercentage}%</strong>
              <span>Group Progress</span>
            </div>
          </div>

          <div className="participants-list">
            {participants.map((participant) => (
              <div className="participant-row" key={participant.userId}>
                <div>
                  <strong>{participant.fullName}</strong>

                  <span>{participant.completedDays} days completed</span>
                </div>

                <div className="participant-progress">
                  {participant.completionPercentage}%
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ChallengeDetails;
