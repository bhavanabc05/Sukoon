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

    language: {
      type: String,
      default: "unknown",
      trim: true,
    },

    // Final emotion selected after the complete pipeline
    emotion: {
      type: String,
      required: true,
      trim: true,
    },

    // Final confidence associated with the selected emotion
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },

    // Original ML model result
    mlEmotion: {
      type: String,
      default: "",
      trim: true,
    },

    mlConfidence: {
      type: Number,
      default: null,
      min: 0,
      max: 1,
    },

    // Groq LLM refinement result
    llmEmotion: {
      type: String,
      default: "",
      trim: true,
    },

    llmConfidence: {
      type: Number,
      default: null,
      min: 0,
      max: 1,
    },

    llmReason: {
      type: String,
      default: "",
      trim: true,
    },

    llmUsed: {
      type: Boolean,
      default: false,
    },

    // Original ML probability distribution
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