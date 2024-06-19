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
  reportCount: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model("Reports", ReportsSchema);
