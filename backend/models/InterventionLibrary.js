const mongoose = require("mongoose");

const interventionLibrarySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "breathing",
        "grounding",
        "mindfulness",
        "relaxation",
        "journaling",
        "reflection",
      ],
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },

    suitableFor: {
      type: [String],
      required: true,
    },

    intensityRange: {
      min: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
      },

      max: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
      },
    },

    instructions: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => value.length > 0,
        message: "At least one instruction is required.",
      },
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: "intervention_library",
  }
);

module.exports = mongoose.model(
  "InterventionLibrary",
  interventionLibrarySchema
);