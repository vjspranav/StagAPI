const express = require("express");
const router = express.Router();

const { findSimilarReports, getModel } = require("../helpers/util");
const Reports = require("../../models/reports");

/* GET reports listing. */
router.get("/", function (req, res, next) {
  Reports.find({}, function (err, reports) {
    if (err) {
      res.status(500).send;
    }
    res.json(
      reports.map((report) => {
        const { titleEmbedding, descriptionEmbedding, ...rest } =
          report.toObject();
        return rest;
      })
    );
  });
});

// GET a specific type of report listing
router.get("/:reportType", function (req, res, next) {
  Reports.find({ reportType: req.params.reportType }, function (err, reports) {
    if (err) {
      res.status(500).send;
    }
    res.json(
      reports.map((report) => {
        const { titleEmbedding, descriptionEmbedding, ...rest } =
          report.toObject();
        return rest;
      })
    );
  });
});

// POST a new report
router.post("/", async function (req, res) {
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

  const model = getModel();

  // check if reportType is valid
  if (!["bug", "feature", "other"].includes(req.body.reportType)) {
    return res.status(400).send("Bad Request");
  }

  // Encode the input report's title and description
  const titleEmbedding = await model.embed([req.body.title]);
  const descriptionEmbedding = await model.embed([req.body.description]);

  const newReport = new Reports({
    devices: [req.body.device],
    version: req.body.version,
    reportType: req.body.reportType,
    title: req.body.title,
    description: req.body.description,
    titleEmbedding: titleEmbedding.arraySync()[0],
    descriptionEmbedding: descriptionEmbedding.arraySync()[0],
    contact: req.body.contact || "",
    log: req.body.log || "",
  });
  newReport
    .save()
    .then((report) => {
      const { titleEmbedding, descriptionEmbedding, ...rest } =
        report.toObject();
      res.json(rest);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
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

  // if not an array, return the error
  if (!Array.isArray(similarReports)) {
    return res.status(500).send(similarReports);
  }

  res.json(similarReports);
});

// Add a route that takes device and repor id and updates the device array in the report and increments the reportCount
router.put("/:reportId", async function (req, res) {
  // check if device is present in the request
  if (!req.body.device) {
    return res.status(400).send("Bad Request");
  }

  Reports.findByIdAndUpdate(
    req.params.reportId,
    {
      $addToSet: { devices: req.body.device },
      $inc: { reportCount: 1 },
    },
    { new: true },
    function (err, report) {
      if (err) {
        res.status(500).send;
      }
      // remove title and description embeddings
      const { titleEmbedding, descriptionEmbedding, ...rest } =
        report.toObject();
      res.json(rest);
    }
  );
});

module.exports = router;
