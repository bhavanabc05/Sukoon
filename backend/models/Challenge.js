const mongoose = require("mongoose");

const challengeTaskSchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: true,
      min: 1,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    taskType: {
      type: String,
      enum: [
        "custom",
        "mood",
        "journal",
        "guidedReflection",
        "stressAwareness",
        "shiftDecompression",
      ],
      default: "custom",
    },
  },
  {
    _id: true,
  }
);

const challengeSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    category: {
      type: String,
      enum: [
        "Reflection",
        "Journaling",
        "Mindfulness",
        "Stress Management",
        "Self-Care",
        "Workplace Wellbeing",
        "Gratitude",
        "Healthy Habits",
      ],
      required: true,
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 30,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    maxParticipants: {
      type: Number,
      default: null,
      min: 1,
    },

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },

    tasks: {
      type: [challengeTaskSchema],
      required: true,
      validate: {
        validator: function (tasks) {
          return tasks.length > 0;
        },
        message: "A challenge must contain at least one task.",
      },
    },

    status: {
      type: String,
      enum: ["upcoming", "active", "completed", "cancelled"],
      default: "upcoming",
    },
  },
  {
    timestamps: true,
    collection: "challenges",
  }
);

const Challenge = mongoose.model("Challenge", challengeSchema);

module.exports = Challenge;