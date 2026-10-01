import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import "./Challenges.css";

const categories = [
  "Reflection",
  "Journaling",
  "Mindfulness",
  "Stress Management",
  "Self-Care",
  "Workplace Wellbeing",
  "Gratitude",
  "Healthy Habits",
];

const taskTypes = [
  {
    value: "custom",
    label: "Custom Task",
    description: "Participant marks this task as completed manually.",
  },
  {
    value: "mood",
    label: "Mood Check-in",
    description: "Automatically completed when a mood check-in is recorded.",
  },
  {
    value: "journal",
    label: "Journal",
    description: "Automatically completed when a journal entry is created.",
  },
  {
    value: "guidedReflection",
    label: "Guided Reflection",
    description:
      "Automatically completed when a guided reflection is completed.",
  },
  {
    value: "stressAwareness",
    label: "Stress Awareness",
    description:
      "Automatically completed when Somatic Stress Mapping is completed.",
  },
  {
    value: "shiftDecompression",
    label: "Shift Decompression",
    description:
      "Automatically completed when Post-Shift Decompression is completed.",
  },
];

function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);

  const [activeTab, setActiveTab] = useState("discover");

  const [loading, setLoading] = useState(true);
  const [myChallengesLoading, setMyChallengesLoading] = useState(false);

  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Reflection",
    duration: 1,
    startDate: new Date().toISOString().split("T")[0],
    maxParticipants: "",
    visibility: "public",
    tasks: [
      {
        title: "",
        description: "",
        taskType: "custom",
      },
    ],
  });

  useEffect(() => {
    loadChallenges();
    loadMyChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/api/challenges");

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load challenges.");
      }

      setChallenges(data.challenges || []);
    } catch (err) {
      console.error("Challenges loading error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMyChallenges = async () => {
    try {
      setMyChallengesLoading(true);

      const response = await apiFetch("/api/challenges/my/joined");

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load your challenges.");
      }

      setMyChallenges(data.challenges || data || []);
    } catch (err) {
      console.error("My challenges loading error:", err);

      setError(err.message);
    } finally {
      setMyChallengesLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleDurationChange = (value) => {
    const duration = Math.min(30, Math.max(1, Number(value) || 1));

    setForm((previous) => {
      const existingTasks = previous.tasks;

      const updatedTasks = Array.from(
        { length: duration },
        (_, index) =>
          existingTasks[index] || {
            title: "",
            description: "",
            taskType: "custom",
          },
      );

      return {
        ...previous,
        duration,
        tasks: updatedTasks,
      };
    });
  };

  const handleTaskChange = (index, field, value) => {
    setForm((previous) => {
      const updatedTasks = [...previous.tasks];

      updatedTasks[index] = {
        ...updatedTasks[index],
        [field]: value,
      };

      return {
        ...previous,
        tasks: updatedTasks,
      };
    });
  };

  const resetCreateForm = () => {
    setForm({
      title: "",
      description: "",
      category: "Reflection",
      duration: 1,
      startDate: new Date().toISOString().split("T")[0],
      maxParticipants: "",
      visibility: "public",
      tasks: [
        {
          title: "",
          description: "",
          taskType: "custom",
        },
      ],
    });

    setCreateError("");
    setCreateSuccess("");
  };

  const handleCreateChallenge = async (event) => {
    event.preventDefault();

    setCreateError("");
    setCreateSuccess("");

    if (!form.title.trim()) {
      setCreateError("Please enter a challenge title.");
      return;
    }

    if (!form.description.trim()) {
      setCreateError("Please enter a challenge description.");
      return;
    }

    if (!form.startDate) {
      setCreateError("Please select a start date.");
      return;
    }

    const invalidTask = form.tasks.find(
      (task) => !task.title.trim() || !task.description.trim(),
    );

    if (invalidTask) {
      setCreateError(
        "Please complete the title and description for every daily task.",
      );
      return;
    }

    try {
      setCreating(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        duration: Number(form.duration),
        startDate: form.startDate,
        maxParticipants:
          form.maxParticipants === "" ? null : Number(form.maxParticipants),
        visibility: form.visibility,
        tasks: form.tasks.map((task, index) => ({
          day: index + 1,
          title: task.title.trim(),
          description: task.description.trim(),
          taskType: task.taskType,
        })),
      };

      const response = await apiFetch("/api/challenges", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create challenge.");
      }

      setCreateSuccess("Challenge created successfully.");

      resetCreateForm();

      setShowCreateForm(false);

      await loadChallenges();
      await loadMyChallenges();
    } catch (err) {
      console.error("Create challenge error:", err);

      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="challenges-page">
      <div className="challenges-header">
        <div>
          <h1>Challenges</h1>
          <p>Take part in structured wellbeing activities and grow together.</p>
        </div>

        <button
          className="create-challenge-btn"
          onClick={() => {
            setShowCreateForm(true);
            setCreateError("");
            setCreateSuccess("");
          }}
        >
          + Create Challenge
        </button>
      </div>

      <div className="challenge-tabs">
        <button
          className={
            activeTab === "discover" ? "challenge-tab active" : "challenge-tab"
          }
          onClick={() => setActiveTab("discover")}
        >
          Discover Challenges
        </button>

        <button
          className={
            activeTab === "mine" ? "challenge-tab active" : "challenge-tab"
          }
          onClick={() => setActiveTab("mine")}
        >
          My Challenges
        </button>
      </div>

      {createSuccess && (
        <div className="challenge-success-message">{createSuccess}</div>
      )}

      {showCreateForm && (
        <div className="create-challenge-panel">
          <div className="create-challenge-panel-header">
            <div>
              <h2>Create a Challenge</h2>
              <p>
                Build a structured wellbeing challenge for yourself and others.
              </p>
            </div>

            <button
              type="button"
              className="close-create-btn"
              onClick={() => {
                setShowCreateForm(false);
                resetCreateForm();
              }}
            >
              ×
            </button>
          </div>

          <form
            onSubmit={handleCreateChallenge}
            className="create-challenge-form"
          >
            {createError && (
              <div className="challenge-form-error">{createError}</div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Challenge Title</label>

                <input
                  type="text"
                  value={form.title}
                  maxLength={100}
                  placeholder="e.g. 7 Days of Gratitude"
                  onChange={(event) =>
                    handleFormChange("title", event.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Category</label>

                <select
                  value={form.category}
                  onChange={(event) =>
                    handleFormChange("category", event.target.value)
                  }
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>

              <textarea
                value={form.description}
                maxLength={1000}
                rows={4}
                placeholder="Describe what participants will work on together."
                onChange={(event) =>
                  handleFormChange("description", event.target.value)
                }
              />
            </div>

            <div className="form-row three-columns">
              <div className="form-group">
                <label>Duration</label>

                <input
                  type="number"
                  min="1"
                  max="30"
                  value={form.duration}
                  onChange={(event) => handleDurationChange(event.target.value)}
                />

                <small>1–30 days</small>
              </div>

              <div className="form-group">
                <label>Start Date</label>

                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    handleFormChange("startDate", event.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Max Participants</label>

                <input
                  type="number"
                  min="1"
                  value={form.maxParticipants}
                  placeholder="No limit"
                  onChange={(event) =>
                    handleFormChange("maxParticipants", event.target.value)
                  }
                />

                <small>Leave empty for no limit</small>
              </div>
            </div>

            <div className="form-group">
              <label>Visibility</label>

              <select
                value={form.visibility}
                onChange={(event) =>
                  handleFormChange("visibility", event.target.value)
                }
              >
                <option value="public">Public — anyone can discover it</option>

                <option value="private">
                  Private — only invited/participating users
                </option>
              </select>
            </div>

            <div className="daily-tasks-section">
              <div className="daily-tasks-header">
                <div>
                  <h3>Daily Tasks</h3>
                  <p>Add one task for each challenge day.</p>
                </div>
              </div>

              <div className="daily-tasks-list">
                {form.tasks.map((task, index) => {
                  const selectedTaskType = taskTypes.find(
                    (type) => type.value === task.taskType,
                  );

                  return (
                    <div className="daily-task-card" key={index}>
                      <div className="daily-task-number">Day {index + 1}</div>

                      <div className="form-group">
                        <label>Task Title</label>

                        <input
                          type="text"
                          value={task.title}
                          placeholder="e.g. Write three things you are grateful for"
                          onChange={(event) =>
                            handleTaskChange(index, "title", event.target.value)
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Task Description</label>

                        <textarea
                          rows={3}
                          value={task.description}
                          placeholder="Describe what participants should do."
                          onChange={(event) =>
                            handleTaskChange(
                              index,
                              "description",
                              event.target.value,
                            )
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Task Type</label>

                        <select
                          value={task.taskType}
                          onChange={(event) =>
                            handleTaskChange(
                              index,
                              "taskType",
                              event.target.value,
                            )
                          }
                        >
                          {taskTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>

                        {selectedTaskType && (
                          <small>{selectedTaskType.description}</small>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="create-form-actions">
              <button
                type="button"
                className="cancel-create-btn"
                onClick={() => {
                  setShowCreateForm(false);
                  resetCreateForm();
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="submit-create-btn"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Challenge"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <div className="challenges-state">Loading challenges...</div>}

      {error && <div className="challenges-error">{error}</div>}

      {activeTab === "discover" && (
        <>
          {!loading &&
            !error &&
            challenges.filter((challenge) => !challenge.joined).length ===
              0 && (
              <div className="challenges-empty">
                <h3>No new challenges available</h3>
                <p>You have joined all currently available challenges.</p>
              </div>
            )}

          {!loading &&
            !error &&
            challenges.filter((challenge) => !challenge.joined).length > 0 && (
              <div className="challenges-grid">
                {challenges
                  .filter((challenge) => !challenge.joined)
                  .map((challenge) => (
                    <div className="challenge-card" key={challenge._id}>
                      <div className="challenge-card-top">
                        <span className="challenge-category">
                          {challenge.category}
                        </span>

                        <span className="challenge-status">
                          {challenge.status}
                        </span>
                      </div>

                      <h2>{challenge.title}</h2>

                      <p className="challenge-description">
                        {challenge.description}
                      </p>

                      <div className="challenge-meta">
                        <span>
                          {challenge.duration} day
                          {challenge.duration !== 1 ? "s" : ""}
                        </span>

                        <span>
                          {challenge.participantCount || 0} participant
                          {challenge.participantCount !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="challenge-card-footer">
                        <span>
                          Created by {challenge.creatorName || "User"}
                        </span>

                        <button
                          onClick={() =>
                            (window.location.href = `/challenges/${challenge._id}`)
                          }
                        >
                          View Challenge
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
        </>
      )}

      {activeTab === "mine" && (
        <>
          {myChallengesLoading && (
            <div className="challenges-state">Loading your challenges...</div>
          )}

          {!myChallengesLoading && myChallenges.length === 0 && (
            <div className="challenges-empty">
              <h3>You haven't joined any challenges yet</h3>

              <p>Discover a challenge and join one to start participating.</p>
            </div>
          )}

          {!myChallengesLoading && myChallenges.length > 0 && (
            <>
              {/* ONGOING CHALLENGES */}

              <div className="my-challenges-section">
                <h2>Ongoing Challenges</h2>

                {myChallenges.filter(
                  (item) => item.participation?.status !== "completed",
                ).length === 0 ? (
                  <div className="challenges-empty small-empty">
                    <p>You have no ongoing challenges.</p>
                  </div>
                ) : (
                  <div className="challenges-grid">
                    {myChallenges
                      .filter(
                        (item) => item.participation?.status !== "completed",
                      )
                      .map((item) => {
                        const challenge = item.challenge || item;

                        const participation = item.participation || {};

                        return (
                          <div className="challenge-card" key={challenge._id}>
                            <div className="challenge-card-top">
                              <span className="challenge-category">
                                {challenge.category}
                              </span>

                              <span className="challenge-status">Ongoing</span>
                            </div>

                            <h2>{challenge.title}</h2>

                            <p className="challenge-description">
                              {challenge.description}
                            </p>

                            <div className="my-progress">
                              <span>Progress</span>

                              <strong>
                                {participation.completionPercentage || 0}%
                              </strong>
                            </div>

                            <div className="mini-progress-bar">
                              <div
                                className="mini-progress-fill"
                                style={{
                                  width: `${
                                    participation.completionPercentage || 0
                                  }%`,
                                }}
                              />
                            </div>

                            <div className="challenge-meta">
                              <span>
                                {challenge.duration} day
                                {challenge.duration !== 1 ? "s" : ""}
                              </span>

                              <span>
                                {participation.completedDays?.length} completed
                              </span>
                            </div>

                            <div className="challenge-card-footer">
                              <span>
                                Created by {item.creatorName || "User"}
                              </span>

                              <button
                                onClick={() =>
                                  (window.location.href = `/challenges/${challenge._id}`)
                                }
                              >
                                Continue
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* COMPLETED CHALLENGES */}

              <div className="my-challenges-section">
                <h2>Completed Challenges</h2>

                {myChallenges.filter(
                  (item) => item.participation?.status === "completed",
                ).length === 0 ? (
                  <div className="challenges-empty small-empty">
                    <p>You haven't completed any challenges yet.</p>
                  </div>
                ) : (
                  <div className="challenges-grid">
                    {myChallenges
                      .filter(
                        (item) => item.participation?.status === "completed",
                      )
                      .map((item) => {
                        const challenge = item.challenge || item;

                        return (
                          <div
                            className="challenge-card completed-challenge-card"
                            key={challenge._id}
                          >
                            <div className="challenge-card-top">
                              <span className="challenge-category">
                                {challenge.category}
                              </span>

                              <span className="challenge-status">
                                Completed
                              </span>
                            </div>

                            <h2>{challenge.title}</h2>

                            <p className="challenge-description">
                              {challenge.description}
                            </p>

                            <div className="completed-percentage">
                              100% completed
                            </div>

                            <div className="challenge-meta">
                              <span>
                                {challenge.duration} day
                                {challenge.duration !== 1 ? "s" : ""}
                              </span>
                            </div>

                            <div className="challenge-card-footer">
                              <span>
                                Created by {item.creatorName || "User"}
                              </span>

                              <button
                                onClick={() =>
                                  (window.location.href = `/challenges/${challenge._id}`)
                                }
                              >
                                View Challenge
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Challenges;
