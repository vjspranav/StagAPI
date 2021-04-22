const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const DownloadsSchema = new Schema({
  onedriveDownloads: {
    type: Number,
    required: true,
  },
  sfgDownloads: {
    type: Number,
    required: true,
  },
  gapps: {
    type: Number,
    required: true,
  },
  pristine: {
    type: Number,
    required: true,
  },
  device: {
    type: String,
    required: true,
  },
});

module.exports = Downloads = mongoose.model("Downloads", DownloadsSchema);
