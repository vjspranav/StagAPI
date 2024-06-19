const express = require("express");
const router = express.Router();

const { findSimilarReports } = require("../helpers/util");
const Reports = require("../../models/reports");

/* GET reports listing. */
router.get("/", function (req, res, next) {
  Reports.find({}, function (err, reports) {
    if (err) {
      res.status(500).send;
    }
    res.json(reports);
  });
});

// GET a specific type of report listing
router.get("/:reportType", function (req, res, next) {
  Reports.find({ reportType: req.params.reportType }, function (err, reports) {
    if (err) {
      res.status(500).send;
    }
    res.json(reports);
  });
});

// POST a new report
router.post("/", function (req, res) {
  //  check if device, version, reportType, title and description are present in the request
  if (
    !req.body.device ||
    !req.body.version ||
    !req.body.reportType ||
    !req.body.title ||
    !req.body.description
  ) {
    return res.status(400).send("Bad Request");
  }

  const newReport = new Reports({
    devices: [req.body.device],
    version: req.body.version,
    reportType: req.body.reportType,
    title: req.body.title,
    description: req.body.description,
  });
  newReport.save().then((report) => res.json(report));
});

// GET similar reports
router.post("/similar", async function (req, res) {
  //   check if title, description and reportType are present in the request
  if (!req.body.title || !req.body.description || !req.body.reportType) {
    return res.status(400).send("Bad Request");
  }
  // check if reportType is valid
  if (!["bug", "feature", "other"].includes(req.body.reportType)) {
    return res.status(400).send("Bad Request");
  }

  const similarReports = await findSimilarReports(req.body);

  res.json(similarReports);
});

module.exports = router;
