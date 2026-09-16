const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reminderType: {
      type: String,
      enum: [
        "hydration",
        "sun_break",
        "movement",
        "breathing",
        "mood_checkin",
        "journal",
        "custom",
      ],
      required: true,
    },

    defaultReminder: {
      type: Boolean,
      default: false,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    scheduleType: {
      type: String,
      enum: ["fixed", "interval"],
      required: true,
    },

    // Used when scheduleType is "fixed"
    time: {
      type: String,
      default: "",
    },

    // Used when scheduleType is "interval"
    startTime: {
      type: String,
      default: "",
    },

    endTime: {
      type: String,
      default: "",
    },

    intervalMinutes: {
      type: Number,
      default: null,
    },

    repeat: {
      type: String,
      enum: ["daily", "weekly"],
      default: "daily",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "reminders",
  }
);

reminderSchema.index(
  { userId: 1, reminderType: 1 },
  {
    unique: true,
    partialFilterExpression: {
      defaultReminder: true,
    },
  }
);

module.exports = mongoose.model("Reminder", reminderSchema);