var express = require("express");
var router = express.Router();
const fetch = require("node-fetch");

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
      res.redirect(link + x[vs[variant]]);
    });
});

module.exports = router;
