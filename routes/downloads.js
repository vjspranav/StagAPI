const e = require("express");
var express = require("express");
var router = express.Router();
const fetch = require("node-fetch");
const Downloads = require("../models/downloads");

let updateDownloads = async (mir, type, device) => {
  let sfg = 0;
  let od = 0;
  let gapps = 0;
  let pristine = 0;
  if (type) pristine += 1;
  else gapps += 1;
  if (mir == "sfg") sfg += 1;
  if (mir == "od") od += 1;
  const download = new Downloads({
    onedriveDownloads: od,
    sfgDownloads: sfg,
    gapps: gapps,
    pristine: pristine,
    device: device,
  });
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
      updateDownloads("od", vs[variant], req.params.device);
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
      updateDownloads("sfg", vs[variant], req.params.device);
      res.redirect(link + x[vs[variant]]);
    });
});

/* GET raw statistics listing. */
router.get("/showraw", async (req, res, next) => {
  let objects = await Downloads.find({});
  console.log(objects);
  res.send(objects);
});

/* GET users listing. */
router.get("/show", async (req, res, next) => {
  let dow = {};
  let gappsTotal = 0;
  let pristineTotal = 0;
  let sfgTotal = 0;
  let odTotal = 0;
  let objects = await Downloads.find({});
  for (i in objects) {
    if (!(objects[i].device in dow)) {
      dow[objects[i].device] = {
        gapps: objects[i].gapps,
        pristine: objects[i].pristine,
        sourceforge: objects[i].sfgDownloads,
        onedrive: objects[i].onedriveDownloads,
      };
      console.log("here");
    } else {
      dow[objects[i].device]["gapps"] += objects[i].gapps;
      dow[objects[i].device]["pristine"] += objects[i].pristine;
      dow[objects[i].device]["sourceforge"] += objects[i].sfgDownloads;
      dow[objects[i].device]["onedrive"] += objects[i].onedriveDownloads;
    }
    gappsTotal += objects[i].gapps;
    pristineTotal += objects[i].pristine;
    sfgTotal += objects[i].sfgDownloads;
    odTotal += objects[i].onedriveDownloads;
  }
  let json = {
    device: dow,
    gappsTotal,
    pristineTotal,
    sfgTotal,
    odTotal,
  };
  res.header("Content-Type", "application/json");
  res.send(JSON.stringify(json, null, 4));
});

module.exports = router;
