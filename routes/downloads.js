const e = require("express");
var express = require("express");
var router = express.Router();
const fetch = require("node-fetch");
const Downloads = require("../models/downloads");

const urlExist = async (url) => (await fetch(url)).ok;

const sendJson = (res, json) => {
  res.header("Content-Type", "application/json");
  res.send(JSON.stringify(json, null, 4));
};

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

let getDevices = async () => {
  let url = "https://sourceforge.net/projects/stagos-11/files/";
  return fetch(url, { method: "Get" })
    .then((res) => res.text())
    .then((text) => {
      let jspn = text.split("<script>");
      let data = {};
      for (i in jspn) {
        if (jspn[i].includes("net.sf.files")) {
          data = jspn[i];
        }
      }
      data = data.split(";")[0];
      data = data.split("net.sf.files =")[1];
      // preserve newlines, etc - use valid JSON
      data = data
        .replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f");
      // remove non-printable and other non-valid JSON chars
      data = data.replace(/[\u0000-\u0019]+/g, "");
      data = JSON.parse(data);
      let x = Object.keys(data);
      return x;
    });
};

// let getfileNames = async (device) => {
// let url = "https://sourceforge.net/projects/stagos-11/files/" + device + "/";
// return fetch(url, { method: "Get" })
//   .then((res) => res.text())
//   .then((text) => {
//     let jspn = text.split("<script>");
//     let data = {};
//     for (i in jspn) {
//       if (jspn[i].includes("net.sf.files")) {
//         data = jspn[i];
//       }
//     }
//     data = data.split(";")[0];
//     data = data.split("net.sf.files =")[1];
//     // preserve newlines, etc - use valid JSON
//     data = data
//       .replace(/\\n/g, "\\n")
//       .replace(/\\'/g, "\\'")
//       .replace(/\\"/g, '\\"')
//       .replace(/\\&/g, "\\&")
//       .replace(/\\r/g, "\\r")
//       .replace(/\\t/g, "\\t")
//       .replace(/\\b/g, "\\b")
//       .replace(/\\f/g, "\\f");
//     // remove non-printable and other non-valid JSON chars
//     data = data.replace(/[\u0000-\u0019]+/g, "");
//     data = JSON.parse(data);
//       let x = Object.keys(data);
//       if (
//         x[0].split(device)[1].split("OFFICIAL")[0] !=
//         x[1].split(device)[1].split("OFFICIAL")[0]
//       )
//         return null;
//       if (x[0].includes("Pristine") && x[1].includes("GApps"))
//         return [x[1], x[0]];
//       else if (x[0].includes("GApps") && x[1].includes("Pristine"))
//         return [x[0], x[1]];
//       return null;
//     });
// };

let getfileNames = async (device) => {
  let gapps = "";
  let pristine = "";
  let date = 0;
  let url =
    "https://raw.githubusercontent.com/StagOS-Devices/OTA/r11/" + device;
  await fetch(url + "/gapps.json", { method: "Get" })
    .then((res, err) => res.json())
    .then(async (json, err) => {
      gapps = json.response[0].filename;
      await fetch(url + "/pristine.json", { method: "Get" })
        .then((res, err) => res.json())
        .then((json, err) => {
          pristine = json.response[0].filename;
          date = json.response[0].datetime;
          // console.log(gapps, pristine);
        })
        .catch(() => {
          return -1;
        });
    })
    .catch(() => {
      return -1;
    });
  if (gapps && pristine) return { gapps, pristine, date };
  return { error: "Not Found" };
};

/* GET users listing. */
router.get("/", async (req, res, next) => {
  res.redirect("https://downloads.stag-os.org");
});

/* GET users listing. */
router.get("/ota/:device/:variant", async (req, res, next) => {
  //console.log("Here 1");
  let variant = req.params.variant;
  let vs = { gapps: 0, pristine: 1 };
  let link = "https://releases.stag-os.workers.dev/" + req.params.device;
  let devices = await getDevices();
  //console.log("Here 2");
  if (!devices.includes(req.params.device)) {
    sendJson(res, { Message: "Invalid device name or unsupported device" });
    return;
  }
  //console.log("Here 3");
  if (variant != "gapps" && variant != "pristine") {
    sendJson(res, {
      Message: "Invalid variant, please select only prisitne or gapps",
    });
    return;
  }
  //console.log("Here 4");
  let files = await getfileNames(req.params.device);
  if (files) {
    //console.log(files);
    // const exists = await urlExist(link + "/" + files[vs[variant]]);
    // if (!exists) {
    //   let sfg =
    //     "https://api.stag-os.org/downloads/sourceforge/" +
    //     req.params.device +
    //     "/" +
    //     variant;

    //   sendJson(res, {
    //     Message: "File not found in mirror",
    //     "Possible Solution": "Try using the sourceforge link",
    //     sfg: sfg,
    //   });
    //   console.log("Here 5");
    // } else {
    updateDownloads("od", vs[variant], req.params.device);
    res.redirect(link + "/" + files[variant]);
    //}
  }
  if (!files) {
    sendJson(res, {
      Message: "Files not found, Please Notify in main group",
    });
  }
});

/* GET users listing. */
router.get("/sourceforge/:device/:variant", async (req, res, next) => {
  variant = req.params.variant;
  vs = { gapps: 0, pristine: 1 };
  link =
    "https://sourceforge.net/projects/stagos-11/files/" + req.params.device;
  let devices = await getDevices();
  if (!devices.includes(req.params.device)) {
    sendJson(res, { Message: "Invalid device name or unsupported device" });
    return;
  }
  if (variant != "gapps" && variant != "pristine") {
    sendJson(res, {
      Message: "Invalid variant, please select only prisitne or gapps",
    });
    return;
  }
  let files = await getfileNames(req.params.device);
  if (!files) {
    res.send({
      Message: "Link not found",
      Reason:
        "Either not officially supported or something is wrong, please notify",
    });
  } else {
    updateDownloads("sfg", vs[variant], req.params.device);
    res.redirect(link + "/" + files[variant]);
  }
});

/* GET raw statistics listing. */
router.get("/showraw", async (req, res, next) => {
  let objects = await Downloads.find({});
  console.log(objects);
  res.send(objects);
});

/* GET raw statistics listing. */
router.get("/stats/:device", async (req, res, next) => {
  let downloads = 0;
  let date = 0;
  let url =
    "https://sourceforge.net/projects/stagos-11/files/" +
    req.params.device +
    "/";
  await fetch(url, { method: "Get" })
    .then((res) => res.text())
    .then(async (text) => {
      let jspn = text.split("<script>");
      let data = {};
      for (i in jspn) {
        if (jspn[i].includes("net.sf.files")) {
          data = jspn[i];
        }
      }
      data = data.split(";")[0];
      data = data.split("net.sf.files =")[1];
      // preserve newlines, etc - use valid JSON
      data = data
        .replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f");
      // remove non-printable and other non-valid JSON chars
      data = data.replace(/[\u0000-\u0019]+/g, "");
      data = JSON.parse(data);
      let files = await getfileNames(req.params.device);
      downloads += data[files.pristine] ? data[files.pristine].downloads : 0;
      downloads += data[files.gapps] ? data[files.gapps].downloads : 0;
      date = files.date;
      let objects = await Downloads.find({ device: req.params.device });
      let total = objects.reduce((prev, cur) => {
        return prev + cur.onedriveDownloads;
      }, 0);
      downloads += total;
    })
    .catch(() => {
      console.log("Error");
    });
  sendJson(res, { downloads, date: date });
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
  sendJson(res, json);
});

/* GET users listing. */
router.get("/show/stats/:device", async (req, res, next) => {
  let dow = {};
  let device = req.params.device;
  let gappsTotal = 0;
  let pristineTotal = 0;
  let objects = await Downloads.find({});
  for (i in objects) {
    if (objects[i].device == device) {
      gappsTotal += objects[i].gapps;
      pristineTotal += objects[i].pristine;
    }
  }
  let json = {
    device: device,
    gapps: gappsTotal,
    pristine: pristineTotal,
  };
  sendJson(res, json);
});

/* GET users listing. */
router.get("/getFile/name/:device", async (req, res, next) => {
  let device = req.params.device;
  let files = await getfileNames(device);
  let json = {
    gapps: files.gapps,
    pristine: files.pristine,
  };
  sendJson(res, json);
});
module.exports = router;
