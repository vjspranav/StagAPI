var express = require("express");
var router = express.Router();
const fetch = require("node-fetch");
const Downloads = require("../models/downloads");

let updateDownloads = async (mir, type) => {
  let sfg = 0;
  let od = 0;
  let gapps = 0;
  let pristine = 0;
  if (type) pristine += 1;
  else gapps += 1;
  if (mir == "sfg") sfg += 1;
  if (mir == "od") od += 1;
  const download = {
    onedriveDownloads: od,
    sfgDownloads: sfg,
    gapps: gapps,
    pristine: pristine,
  };
  await download.save();
};

/* GET users listing. */
router.get("/:device/:variant", function (req, res, next) {
  variant = req.params.variant;
  vs = { gapps: 0, pristine: 1 };
  url = "https://releases.stag-os.workers.dev/" + req.params.device + "/";
  link = "https://releases.stag-os.workers.dev/" + req.params.device;
  x = [];
  fetch(url, { method: "Get" })
    .then((res) => res.text())
    .then((text) => {
      let files = text.split("/" + req.params.device);
      for (i in files) {
        if (files[i].includes("StagOS-" + req.params.device)) {
          x.push(files[i].split('"')[0]);
        }
      }
      updateDownloads("od", vs[variant]);
      res.redirect(link + x[vs[variant]]);
    });
});

/* GET users listing. */
router.get("/sourceforge/:device/:variant", function (req, res, next) {
  variant = req.params.variant;
  vs = { gapps: 0, pristine: 1 };
  url = "https://releases.stag-os.workers.dev/" + req.params.device + "/";
  link =
    "https://sourceforge.net/projects/stagos-11/files/" + req.params.device;
  x = [];
  fetch(url, { method: "Get" })
    .then((res) => res.text())
    .then((text) => {
      if (!text) {
        res.send({ Error: "Not found" });
      }
      let files = text.split("/" + req.params.device);
      for (i in files) {
        if (files[i].includes("StagOS-" + req.params.device)) {
          x.push(files[i].split('"')[0]);
        }
      }
      updateDownloads("sfg", vs[variant]);
      res.redirect(link + x[vs[variant]]);
    });
});

/* GET users listing. */
router.get("/show", function (req, res, next) {
  Downloads.find({}, (objects) => {
    res.send(objects);
  });
});

module.exports = router;
