var express = require("express");
var router = express.Router();
const fetch = require("node-fetch");

/* GET users listing. */
router.get("/:device/:variant", function (req, res, next) {
  let url =
    "https://raw.githubusercontent.com/StagOS-Devices/OTA/u14/" +
    req.params.device +
    "/" +
    req.params.variant +
    ".json";
  fetch(url, { method: "Get" })
    .then((res) => res.json())
    .then((json) => {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify(json, null, 4));
    });
});

module.exports = router;
