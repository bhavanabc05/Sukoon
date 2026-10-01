const mongoose = require("mongoose");

const textEmotionRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    cleanedText: {
      type: String,
      default: "",
      trim: true,
    },

    emotion: {
      type: String,
      required: true,
      trim: true,
    },

    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },

    probabilities: {
      type: Map,
      of: Number,
      default: {},
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "text_emotion_records",
  }
);

module.exports = mongoose.model(
  "TextEmotionRecord",
  textEmotionRecordSchema
);