const mongoose = require("mongoose");

const emotionalGranularitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    primaryEmotion: {
      type: String,
      required: true,
      trim: true,
    },

    secondaryEmotion: {
      type: String,
      required: true,
      trim: true,
    },

    specificEmotion: {
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

    source: {
      type: String,
      default: "self_reported",
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "emotional_granularity_records",
  }
);

const EmotionalGranularity = mongoose.model(
  "EmotionalGranularity",
  emotionalGranularitySchema
);

module.exports = EmotionalGranularity;