import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import "./Reminders.css";

const REMINDER_TYPES = [
  {
    value: "hydration",
    label: "Hydration",
    icon: "💧",
    description: "Take regular water breaks",
  },
  {
    value: "sun_break",
    label: "Sun Break",
    icon: "☀️",
    description: "Take a short outdoor/light break",
  },
  {
    value: "movement",
    label: "Movement",
    icon: "🚶",
    description: "Stand, stretch, or take a short walk",
  },
  {
    value: "breathing",
    label: "Breathing",
    icon: "🧘",
    description: "Pause for a short breathing exercise",
  },
  {
    value: "mood_checkin",
    label: "Mood Check-in",
    icon: "📝",
    description: "Check in with how you are feeling",
  },
  {
    value: "journal",
    label: "Journal",
    icon: "📔",
    description: "Take a moment to write and reflect",
  },
  {
    value: "custom",
    label: "Custom",
    icon: "✨",
    description: "Create your own reminder",
  },
];

const DEFAULTS = {
  hydration: {
    title: "Hydration",
    description: "Take a short water break",
    scheduleType: "interval",
    startTime: "10:00",
    endTime: "18:00",
    intervalMinutes: 120,
  },
  sun_break: {
    title: "Sun Break",
    description: "Take a short outdoor/light break",
    scheduleType: "fixed",
    time: "11:00",
  },
  movement: {
    title: "Movement",
    description: "Stand, stretch, or take a short walk",
    scheduleType: "interval",
    startTime: "09:00",
    endTime: "18:00",
    intervalMinutes: 90,
  },
  breathing: {
    title: "Breathing",
    description: "Pause for a short breathing exercise",
    scheduleType: "fixed",
    time: "15:00",
  },
  mood_checkin: {
    title: "Mood Check-in",
    description: "Check in with how you are feeling",
    scheduleType: "fixed",
    time: "20:00",
  },
  journal: {
    title: "Journal",
    description: "Take a moment to write and reflect",
    scheduleType: "fixed",
    time: "21:30",
  },
  custom: {
    title: "",
    description: "",
    scheduleType: "fixed",
    time: "09:00",
  },
};

function formatTime(time) {
  if (!time) return "";

  const [hours, minutes] = time.split(":");
  const hour = Number(hours);

  if (Number.isNaN(hour)) return time;

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${suffix}`;
}

function formatInterval(minutes) {
  if (!minutes) return "";

  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return hours === 1 ? "Every hour" : `Every ${hours} hours`;
  }

  return `Every ${minutes} minutes`;
}

function getReminderType(value) {
  return (
    REMINDER_TYPES.find((type) => type.value === value) ||
    REMINDER_TYPES[REMINDER_TYPES.length - 1]
  );
}

function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

  const [form, setForm] = useState({
    reminderType: "hydration",
    title: "Hydration",
    description: "Take a short water break",
    scheduleType: "interval",
    time: "",
    startTime: "10:00",
    endTime: "18:00",
    intervalMinutes: 120,
    repeat: "daily",
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  async function fetchReminders() {
    setLoading(true);
    setError("");

    try {
      /*
       * First check whether this user already has reminders.
       *
       * If the user has none, the backend creates the
       * default wellbeing reminders.
       *
       * If the user already has reminders, the backend
       * simply returns the existing reminders without
       * creating duplicates.
       */
      const setupResponse = await apiFetch("/api/reminders/setup-defaults", {
        method: "POST",
      });

      if (!setupResponse) return;

      const setupData = await setupResponse.json();

      if (!setupResponse.ok) {
        throw new Error(setupData.message || "Failed to set up reminders");
      }

      setReminders(setupData.reminders || []);
    } catch (err) {
      console.error("Reminder fetch error:", err);
      setError(err.message || "Unable to load reminders.");
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    const defaults = DEFAULTS.hydration;

    setEditingReminder(null);

    setForm({
      reminderType: "hydration",
      title: defaults.title,
      description: defaults.description,
      scheduleType: defaults.scheduleType,
      time: "",
      startTime: defaults.startTime,
      endTime: defaults.endTime,
      intervalMinutes: defaults.intervalMinutes,
      repeat: "daily",
    });

    setShowForm(true);
  }

  function handleTypeChange(type) {
    const defaults = DEFAULTS[type];

    setForm((previous) => ({
      ...previous,
      reminderType: type,
      title: defaults.title,
      description: defaults.description,
      scheduleType: defaults.scheduleType,
      time: defaults.time || "",
      startTime: defaults.startTime || "",
      endTime: defaults.endTime || "",
      intervalMinutes: defaults.intervalMinutes || 120,
    }));
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function openEditForm(reminder) {
    setEditingReminder(reminder);

    setForm({
      reminderType: reminder.reminderType,
      title: reminder.title || "",
      description: reminder.description || "",
      scheduleType: reminder.scheduleType || "fixed",
      time: reminder.time || "",
      startTime: reminder.startTime || "",
      endTime: reminder.endTime || "",
      intervalMinutes: reminder.intervalMinutes || 120,
      repeat: reminder.repeat || "daily",
    });

    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingReminder(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Please enter a reminder title.");
      return;
    }

    if (form.scheduleType === "fixed" && !form.time) {
      setError("Please choose a time.");
      return;
    }

    if (form.scheduleType === "interval") {
      if (!form.startTime || !form.endTime) {
        setError("Please choose a start and end time.");
        return;
      }

      if (!form.intervalMinutes || Number(form.intervalMinutes) <= 0) {
        setError("Please choose a valid interval.");
        return;
      }
    }

    const payload = {
      reminderType: form.reminderType,
      title: form.title.trim(),
      description: form.description.trim(),
      scheduleType: form.scheduleType,
      time: form.scheduleType === "fixed" ? form.time : "",
      startTime: form.scheduleType === "interval" ? form.startTime : "",
      endTime: form.scheduleType === "interval" ? form.endTime : "",
      intervalMinutes:
        form.scheduleType === "interval" ? Number(form.intervalMinutes) : null,
      repeat: form.repeat,
    };

    try {
      let response;

      if (editingReminder) {
        response = await apiFetch(`/api/reminders/${editingReminder._id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        response = await apiFetch("/api/reminders", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save reminder");
      }

      closeForm();
      await fetchReminders();
    } catch (err) {
      console.error("Reminder save error:", err);
      setError(err.message || "Unable to save reminder.");
    }
  }

  async function toggleReminder(reminder) {
    setError("");

    try {
      const response = await apiFetch(`/api/reminders/${reminder._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: reminder.status === "active" ? "inactive" : "active",
        }),
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update reminder");
      }

      setReminders((previous) =>
        previous.map((item) =>
          item._id === reminder._id ? data.reminder : item,
        ),
      );
    } catch (err) {
      console.error("Reminder toggle error:", err);
      setError(err.message || "Unable to update reminder.");
    }
  }

  async function deleteReminder(reminder) {
    const confirmed = window.confirm(`Delete "${reminder.title}" reminder?`);

    if (!confirmed) return;

    setError("");

    try {
      const response = await apiFetch(`/api/reminders/${reminder._id}`, {
        method: "DELETE",
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete reminder");
      }

      setReminders((previous) =>
        previous.filter((item) => item._id !== reminder._id),
      );
    } catch (err) {
      console.error("Reminder delete error:", err);
      setError(err.message || "Unable to delete reminder.");
    }
  }

  function renderSchedule(reminder) {
    if (reminder.scheduleType === "interval") {
      return `${formatInterval(reminder.intervalMinutes)} • ${formatTime(
        reminder.startTime,
      )} – ${formatTime(reminder.endTime)}`;
    }

    return `${formatTime(reminder.time)} • ${
      reminder.repeat === "daily" ? "Every day" : "Every week"
    }`;
  }

  return (
    <div className="reminders-page">
      <div className="reminders-header">
        <div>
          <p className="reminders-eyebrow">SUPPORT</p>

          <h1>Reminders</h1>

          <p className="reminders-subtitle">
            Create small moments of care throughout your day.
          </p>
        </div>

        <button className="add-reminder-button" onClick={openAddForm}>
          + Add Reminder
        </button>
      </div>

      {error && <div className="reminder-error">{error}</div>}

      {loading ? (
        <div className="reminders-empty-state">
          <div className="reminders-loading">Setting up your reminders...</div>
        </div>
      ) : reminders.length === 0 ? (
        <div className="reminders-empty-state">
          <div className="empty-icon">🌿</div>

          <h2>No reminders yet</h2>

          <p>
            Add a gentle reminder to help you pause, move, reflect, or care for
            yourself during the day.
          </p>

          <button className="empty-add-button" onClick={openAddForm}>
            Create your first reminder
          </button>
        </div>
      ) : (
        <div className="reminders-list">
          {reminders.map((reminder) => {
            const type = getReminderType(reminder.reminderType);

            return (
              <div
                className={`reminder-card ${
                  reminder.status === "inactive" ? "reminder-inactive" : ""
                }`}
                key={reminder._id}
              >
                <div className="reminder-icon">{type.icon}</div>

                <div className="reminder-content">
                  <div className="reminder-title-row">
                    <h2>{reminder.title}</h2>

                    <span
                      className={`reminder-status ${
                        reminder.status === "active"
                          ? "status-active"
                          : "status-inactive"
                      }`}
                    >
                      {reminder.status === "active" ? "Active" : "Paused"}
                    </span>
                  </div>

                  <p className="reminder-description">
                    {reminder.description || type.description}
                  </p>

                  <div className="reminder-schedule">
                    <span>🕐</span>

                    <span>{renderSchedule(reminder)}</span>
                  </div>
                </div>

                <div className="reminder-actions">
                  <button
                    className="reminder-action-button"
                    onClick={() => toggleReminder(reminder)}
                  >
                    {reminder.status === "active" ? "Pause" : "Activate"}
                  </button>

                  <button
                    className="reminder-action-button"
                    onClick={() => openEditForm(reminder)}
                  >
                    Edit
                  </button>

                  <button
                    className="reminder-action-button delete-action"
                    onClick={() => deleteReminder(reminder)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="reminder-modal-overlay">
          <div className="reminder-modal">
            <div className="reminder-modal-header">
              <div>
                <p className="reminders-eyebrow">
                  {editingReminder ? "EDIT REMINDER" : "NEW REMINDER"}
                </p>

                <h2>
                  {editingReminder
                    ? "Update your reminder"
                    : "Create a reminder"}
                </h2>
              </div>

              <button
                className="modal-close-button"
                onClick={closeForm}
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <label>What would you like to be reminded about?</label>

                <div className="reminder-type-grid">
                  {REMINDER_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      className={`reminder-type-card ${
                        form.reminderType === type.value ? "selected-type" : ""
                      }`}
                      onClick={() => handleTypeChange(type.value)}
                    >
                      <span className="type-icon">{type.icon}</span>

                      <span className="type-label">{type.label}</span>

                      <span className="type-description">
                        {type.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <label htmlFor="title">Reminder title</label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Take a water break"
                />
              </div>

              <div className="form-section">
                <label htmlFor="description">
                  Description
                  <span className="optional-label">Optional</span>
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Add a short note..."
                  rows="3"
                />
              </div>

              <div className="form-section">
                <label>Schedule</label>

                <div className="schedule-toggle">
                  <button
                    type="button"
                    className={
                      form.scheduleType === "fixed" ? "selected-schedule" : ""
                    }
                    onClick={() =>
                      setForm((previous) => ({
                        ...previous,
                        scheduleType: "fixed",
                      }))
                    }
                  >
                    One fixed time
                  </button>

                  <button
                    type="button"
                    className={
                      form.scheduleType === "interval"
                        ? "selected-schedule"
                        : ""
                    }
                    onClick={() =>
                      setForm((previous) => ({
                        ...previous,
                        scheduleType: "interval",
                      }))
                    }
                  >
                    Repeat at intervals
                  </button>
                </div>
              </div>

              {form.scheduleType === "fixed" ? (
                <div className="form-row">
                  <div className="form-section form-field">
                    <label htmlFor="time">Time</label>

                    <input
                      id="time"
                      name="time"
                      type="time"
                      value={form.time}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="form-row">
                    <div className="form-section form-field">
                      <label htmlFor="startTime">Start</label>

                      <input
                        id="startTime"
                        name="startTime"
                        type="time"
                        value={form.startTime}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-section form-field">
                      <label htmlFor="endTime">End</label>

                      <input
                        id="endTime"
                        name="endTime"
                        type="time"
                        value={form.endTime}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-section">
                    <label htmlFor="intervalMinutes">Remind me every</label>

                    <select
                      id="intervalMinutes"
                      name="intervalMinutes"
                      value={form.intervalMinutes}
                      onChange={handleChange}
                    >
                      <option value="30">30 minutes</option>

                      <option value="60">1 hour</option>

                      <option value="90">90 minutes</option>

                      <option value="120">2 hours</option>

                      <option value="180">3 hours</option>

                      <option value="240">4 hours</option>
                    </select>
                  </div>
                </>
              )}

              <div className="form-section">
                <label htmlFor="repeat">Repeat</label>

                <select
                  id="repeat"
                  name="repeat"
                  value={form.repeat}
                  onChange={handleChange}
                >
                  <option value="daily">Every day</option>

                  <option value="weekly">Every week</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button type="submit" className="save-reminder-button">
                  {editingReminder ? "Save Changes" : "Save Reminder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reminders;
