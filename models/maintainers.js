const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Create a MaintainerSchema
 * String Name mandatory
 * String github username mandatory
 * String email mandatory
 * String Device name
 * String device_codename mandatory
 * String device_tree mandatory
 * String kernel mandatory
 * String vendor mandatory
 * String common_tree (optional)
 * String common_vendor (optional)
 * String other dependencies array of strings
 * String status (Applied, Reviewing, Accepted, Rejected)
 */
const MaintainersSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  tg_username: {
    type: String,
    required: true,
  },
  github_username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  device_name: {
    type: String,
    required: false,
  },
  device_company: {
    type: String,
    required: true,
  },
  device_codename: {
    type: String,
    required: true,
  },
  device_tree: {
    type: String,
    required: true,
  },
  kernel: {
    type: String,
    required: true,
  },
  vendor: {
    type: String,
    required: true,
  },
  common_tree: {
    type: String,
    required: false,
  },
  common_vendor: {
    type: String,
    required: false,
  },
  other_dependencies: {
    type: Array,
    required: false,
  },
  selinux_status: {
    type: String,
    required: true,
    range: ["Enforcing", "Permissive"],
  },
  status: {
    type: String,
    required: true,
    range: ["Applied", "Reviewing", "Accepted", "Rejected"],
  },
  review: {
    type: String,
    required: false,
  },
  version: {
    type: String,
    required: true,
    range: ["12", "13"],
  },
});

module.exports = Maintainers = mongoose.model("Maintainers", MaintainersSchema);
