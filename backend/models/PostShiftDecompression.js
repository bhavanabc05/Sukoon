const mongoose = require("mongoose");

const postShiftDecompressionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    shiftType: {
      type: String,
      required: true,
      enum: [
        "Day Shift",
        "Evening Shift",
        "Night Shift",
        "Rotating Shift",
        "Other",
      ],
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    emotionalState: {
      mood: {
        type: String,
        required: true,
        trim: true,
      },

      intensity: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
      },
    },

    stressLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    energyLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    selectedActivity: {
      type: String,
      enum: [
        "breathing",
        "grounding",
        "relaxation",
        "reflection",
        "none",
      ],
      default: "none",
    },

    activityDuration: {
      type: Number,
      default: 0,
      min: 0,
    },

    reflection: {
      type: String,
      default: "",
      trim: true,
    },

    voiceTranscript: {
      type: String,
      default: "",
      trim: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "post_shift_decompressions",
  }
);

module.exports = mongoose.model(
  "PostShiftDecompression",
  postShiftDecompressionSchema
);