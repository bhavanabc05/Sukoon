const mongoose = require("mongoose");

const moodRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

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

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "mood_records",
  }
);

const MoodRecord = mongoose.model("MoodRecord", moodRecordSchema);

module.exports = MoodRecord;