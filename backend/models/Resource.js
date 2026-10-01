const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Stress Management",
        "Mental Wellbeing",
        "Sleep & Recovery",
        "Emotional Wellbeing",
        "Self-Care",
        "Workplace Wellbeing",
        "Mindfulness",
        "Journaling",
      ],
      required: true,
    },

    resourceType: {
      type: String,
      enum: [
        "Article",
        "Guide",
        "Video",
        "Exercise",
        "External Resource",
      ],
      required: true,
    },

    content: {
      type: String,
      default: "",
      trim: true,
    },

    externalUrl: {
      type: String,
      default: "",
      trim: true,
    },

    source: {
      type: String,
      default: "",
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "resources",
  }
);

module.exports = mongoose.model("Resource", resourceSchema);