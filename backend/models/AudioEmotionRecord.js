const mongoose = require("mongoose");

const audioEmotionRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    transcript: {
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

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "audio_emotion_records",
  }
);

module.exports = mongoose.model(
  "AudioEmotionRecord",
  audioEmotionRecordSchema
);