const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const DownloadsSchema = new Schema({
  onedriveDownload: {
    type: Number,
    required: True,
  },
  sfgDownload: {
    type: Number,
    required: True,
  },
  gapps: {
    type: Number,
    required: True,
  },
  pristine: {
    type: Number,
    required: True,
  },
});

module.exports = Downloads = mongoose.model("Downloads", DownloadsSchema);
