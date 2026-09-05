const mongoose = require("mongoose");

const shiftCheckinSchema = new mongoose.Schema(
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

    checkInTime: {
      type: Date,
      default: Date.now,
    },

    mood: {
      emotion: {
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

    energyLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    stressLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    emotionalReadiness: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    note: {
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
    collection: "shift_checkins",
  }
);

module.exports = mongoose.model(
  "ShiftCheckin",
  shiftCheckinSchema
);