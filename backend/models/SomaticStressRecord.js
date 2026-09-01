const mongoose = require("mongoose");

const symptomSchema = new mongoose.Schema(
  {
    bodyArea: {
      type: String,
      required: true,
    },

    sensation: {
      type: String,
      required: true,
    },

    stressLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
  },
  { _id: false }
);

const somaticStressRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    symptoms: {
      type: [symptomSchema],
      required: true,
      validate: {
        validator: (value) => value.length > 0,
        message: "At least one body symptom is required.",
      },
    },

    severity: {
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
    collection: "somatic_stress_records",
  }
);

module.exports = mongoose.model(
  "SomaticStressRecord",
  somaticStressRecordSchema
);