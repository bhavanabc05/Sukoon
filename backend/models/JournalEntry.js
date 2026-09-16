const mongoose = require("mongoose");

const journalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      trim: true,
      default: "",
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    emotion: {
      type: String,
      trim: true,
      default: "",
    },

    emotionIntensity: {
      type: Number,
      min: 1,
      max: 10,
      default: null,
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
    collection: "journal_entries",
  }
);

module.exports = mongoose.model("JournalEntry", journalEntrySchema);