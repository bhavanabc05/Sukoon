import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../utils/api";
import "./ReminderNotification.css";

const CHECK_INTERVAL = 5000;

function getTodayKey() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(now.getDate()).padStart(2, "0")}`;
}

function getCurrentMinutes() {
  const now = new Date();

  return now.getHours() * 60 + now.getMinutes();
}

function timeToMinutes(time) {
  if (!time) return null;

  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function isReminderDue(reminder) {
  if (!reminder || reminder.status !== "active") {
    return false;
  }

  const currentMinutes = getCurrentMinutes();

  // Weekly reminders repeat on the same weekday
  // on which they were created.
  if (reminder.repeat === "weekly") {
    const createdDate = new Date(reminder.createdAt);
    const today = new Date();

    if (createdDate.getDay() !== today.getDay()) {
      return false;
    }
  }

  // Fixed-time reminder
  if (reminder.scheduleType === "fixed") {
    const reminderMinutes = timeToMinutes(reminder.time);

    if (reminderMinutes === null) {
      return false;
    }

    return currentMinutes === reminderMinutes;
  }

  // Interval reminder
  if (reminder.scheduleType === "interval") {
    const startMinutes = timeToMinutes(reminder.startTime);
    const endMinutes = timeToMinutes(reminder.endTime);
    const interval = Number(reminder.intervalMinutes);

    if (
      startMinutes === null ||
      endMinutes === null ||
      !interval ||
      interval <= 0
    ) {
      return false;
    }

    if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
      return false;
    }

    const difference = currentMinutes - startMinutes;

    return difference % interval === 0;
  }

  return false;
}

function speakReminder(title, description) {
  if (!("speechSynthesis" in window)) {
    console.warn("Speech synthesis is not supported.");
    return;
  }

  const message = description ? `${title}. ${description}` : title;

  // Stop any previous speech
  window.speechSynthesis.cancel();

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(message);

    utterance.lang = "en-IN";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();

    console.log("Available speech voices:", voices);

    // Prefer Indian English
    const indianVoice = voices.find((voice) =>
      voice.lang.toLowerCase().includes("en-in"),
    );

    // Otherwise use any English voice
    const englishVoice = voices.find((voice) =>
      voice.lang.toLowerCase().startsWith("en"),
    );

    if (indianVoice) {
      utterance.voice = indianVoice;
    } else if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      console.log("Reminder speech started");
    };

    utterance.onend = () => {
      console.log("Reminder speech finished");
    };

    utterance.onerror = (event) => {
      console.error("Reminder speech error:", event.error);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Give the browser time to load its voices.
  const voices = window.speechSynthesis.getVoices();

  if (voices.length > 0) {
    speak();
  } else {
    window.speechSynthesis.addEventListener("voiceschanged", speak, {
      once: true,
    });
  }
}

function ReminderNotification() {
  const [notification, setNotification] = useState(null);

  const remindersRef = useRef([]);
  const notifiedRef = useRef(new Set());

  async function loadReminders() {
    try {
      const response = await apiFetch("/api/reminders");

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Reminder notification fetch error:",
          data.message || "Unable to load reminders",
        );
        return;
      }

      remindersRef.current = data.reminders || [];

      checkForDueReminders();
    } catch (error) {
      console.error("Reminder notification error:", error);
    }
  }

  function checkForDueReminders() {
    const reminders = remindersRef.current;

    if (!reminders.length) {
      return;
    }

    const now = new Date();
    const todayKey = getTodayKey();
    const currentMinutes = getCurrentMinutes();

    for (const reminder of reminders) {
      if (!isReminderDue(reminder)) {
        continue;
      }

      const notificationKey = `${todayKey}-${currentMinutes}-${reminder._id}`;

      // Prevent the same reminder from appearing repeatedly
      // during the same minute.
      if (notifiedRef.current.has(notificationKey)) {
        continue;
      }

      notifiedRef.current.add(notificationKey);

      setNotification({
        id: reminder._id,
        title: reminder.title,
        description: reminder.description,
        reminderType: reminder.reminderType,
      });

      // Speak the actual reminder message.
      speakReminder(reminder.title, reminder.description);

      break;
    }
  }

  useEffect(() => {
    // Load voices once they become available.
    const handleVoicesChanged = () => {
      window.speechSynthesis.getVoices();
    };

    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();

      window.speechSynthesis.addEventListener(
        "voiceschanged",
        handleVoicesChanged,
      );
    }

    // Initial reminder load.
    loadReminders();

    // Check every 5 seconds instead of every 30 seconds.
    const interval = setInterval(() => {
      loadReminders();
    }, CHECK_INTERVAL);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadReminders();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);

      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if ("speechSynthesis" in window) {
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          handleVoicesChanged,
        );

        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!notification) {
      return;
    }

    const timeout = setTimeout(() => {
      setNotification(null);
    }, 10000);

    return () => clearTimeout(timeout);
  }, [notification]);

  function dismissNotification() {
    setNotification(null);
  }

  if (!notification) {
    return null;
  }

  return (
    <div className="reminder-notification">
      <div className="reminder-notification-icon">🔔</div>

      <div className="reminder-notification-content">
        <div className="reminder-notification-label">Reminder</div>

        <h3>{notification.title}</h3>

        {notification.description && <p>{notification.description}</p>}
      </div>

      <button
        className="reminder-notification-close"
        onClick={dismissNotification}
        aria-label="Dismiss reminder"
      >
        ×
      </button>
    </div>
  );
}

export default ReminderNotification;
