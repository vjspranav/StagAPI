const { range } = require("@tensorflow/tfjs-node");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const ReportsSchema = new Schema({
  devices: {
    type: [String],
    required: false,
  },
  version: {
    type: String,
    required: true,
  },
  reportType: {
    type: String,
    required: true,
    range: ["bug", "feature", "other"],
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  titleEmbedding: {
    type: [Number],
    required: false,
  },
  descriptionEmbedding: {
    type: [Number],
    required: false,
  },
  reportCount: {
    type: Number,
    default: 1,
  },
  status: {
    type: String,
    required: true,
    default: "open",
    range: ["open", "closed"],
  },
  fix: {
    type: String,
    required: false,
  },
  contact: {
    type: String,
    required: false,
  },
  log: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Reports", ReportsSchema);
