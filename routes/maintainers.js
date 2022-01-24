const express = require("express");
const router = express.Router();
const Maintainers = require("../models/maintainers");
const { create_pr } = require("./helpers/create_pr");

// Getting pass
let config = {};
try {
  config = require("../keys/prod.js");
} catch (ex) {
  config = {
    pass: process.env.ADMIN_PASS,
  };
}
const password = config.pass;

/* GET home page. */
router.get("/", (req, res, next) => {
  return res.json({
    status: 200,
    message: "Maintainer application backend",
  });
});

/* Get all device companies */
router.get("/companies", (req, res, next) => {
  Maintainers.find({}, (err, maintainers) => {
    if (err) {
      return res.json({
        status: 500,
        message: "Error getting companies",
        error: err,
      });
    }
    let companies = [];
    maintainers.forEach((maintainer) => {
      if (companies.indexOf(maintainer.company) === -1) {
        companies.push(maintainer.company);
      }
    });

    return res.json({
      status: 200,
      message: "Companies",
      companies: companies,
    });
  });
});

/* POST apply for maintainer */
router.post("/apply", (req, res, next) => {
  /**
   * @param {String} github_username
   * @param {String} email
   * @param {String} device_name
   * @param {String} device_company
   * @param {String} device_codename
   * @param {String} device_tree
   * @param {String} kernel
   * @param {String} vendor
   * @param {String} common_tree
   * @param {String} common_vendor
   * @param {Array} other_dependencies
   * @param {String} selinux_status
   * @param {String} status
   * @param {String} name
   * @param {String} tg_username
   * get the data from the request
   * and save it to the database
   * @returns {Object}
   */
  const {
    github_username,
    email,
    device_name,
    device_company,
    device_codename,
    device_tree,
    kernel,
    vendor,
    common_tree,
    common_vendor,
    other_dependencies,
    selinux_status,
    name,
    tg_username,
  } = req.body;
  const status = "Applied";
  const newMaintainer = new Maintainers({
    github_username,
    email,
    device_name,
    device_company,
    device_codename,
    device_tree,
    kernel,
    vendor,
    common_tree,
    common_vendor,
    other_dependencies,
    selinux_status,
    status,
    name,
    tg_username,
  });
  newMaintainer
    .save()
    .then((maintainer) => {
      return res.json({
        status: 200,
        message: "Maintainer application submitted",
        data: maintainer,
      });
    })
    .catch((err) => {
      return res.json({
        status: 500,
        message: "Error submitting maintainer application",
        error: err,
      });
    });
});

/* GET all maintainers */
router.get("/all", (req, res, next) => {
  Maintainers.find()
    .then((maintainers) => {
      return res.json({
        status: 200,
        message: "All maintainers",
        data: maintainers,
      });
    })
    .catch((err) => {
      return res.json({
        status: 500,
        message: "Error getting all maintainers",
        error: err,
      });
    });
});

/* GET all pending maintainers */
router.get("/pending", (req, res, next) => {
  // "Applied" or "Reviewing"
  Maintainers.find({ $or: [{ status: "Applied" }, { status: "Reviewing" }] })
    .then((maintainers) => {
      return res.json({
        status: 200,
        message: "All pending maintainers",
        data: maintainers,
      });
    })
    .catch((err) => {
      return res.json({
        status: 500,
        message: "Error getting all pending maintainers",
        error: err,
      });
    });
});

/* Post request to update status */
router.post("/updateStatus", (req, res, next) => {
  const { id, status, pass } = req.body;
  if (pass === password)
    Maintainers.findByIdAndUpdate(id, { status })
      .then((maintainer) => {
        return res.json({
          status: 200,
          message: "Maintainer status updated",
          data: maintainer,
        });
      })
      .catch((err) => {
        return res.json({
          status: 500,
          message: "Error updating maintainer status",
          error: err,
        });
      });
  else
    return res.json({
      status: 403,
      message: "Wrong password",
    });
});

/* Post request to create pr */
router.post("/createPR", (req, res, next) => {
  const { id, pass } = req.body;
  if (pass === password) {
    Maintainers.findById(id)
      .then((maintainer) => {
        if (maintainer.status == "Reviewing") {
          create_pr(
            maintainer.device_name,
            maintainer.device_company,
            maintainer.device_codename,
            maintainer.tg_username
          );
          Maintainers.findByIdAndUpdate(id, { status: "Accepted" });
          return res.json({
            status: 200,
            message: "Maintainer pr created",
            data: maintainer,
          });
        } else {
          return res.json({
            status: 403,
            message:
              maintainer.status == "Accepted"
                ? "PR Already created"
                : "Maintainer not approved",
            data: maintainer,
          });
        }
      })
      .catch((err) => {
        return res.json({
          status: 500,
          message: "Error creating maintainer pr",
          error: err,
        });
      });
  } else {
    return res.json({
      status: 403,
      message: "Wrong password",
    });
  }
});

module.exports = router;
