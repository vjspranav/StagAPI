const express = require("express");
const router = express.Router();
const Maintainers = require("../../models/maintainers");
const { create_pr } = require("../helpers/create_pr");
const nodeMailer = require("nodemailer");
const { zoho_email, zoho_pass, tg_link } = require("../../keys/prod");
const ObjectID = require("mongodb").ObjectID;

// Setup node mailer
const transporter = nodeMailer.createTransport({
  name: "zoho.in",
  host: "smtp.zoho.in",
  secure: true,
  port: 465,
  auth: {
    user: zoho_email,
    pass: zoho_pass,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("SMTP Connection successful");
  }
});

const send_email = (email, subject, text) => {
  transporter.sendMail(
    {
      from: zoho_email,
      to: email,
      subject: subject,
      text: text,
    },
    (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    }
  );
};

// send_email("pranavasri@live.in", "Test", "Test");
// Getting pass
let config = {};
try {
  config = require("../../keys/prod.js");
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
      // Check if maintiner.version exists and is not eqal to 13
      if (!maintainer.version) {
        return;
      }
      if (maintainer.version && maintainer.version !== "13") {
        return;
      }
      maintainer.company = maintainer.device_company.trim();
      // First letter of company name to uppercase
      maintainer.device_company =
        maintainer.device_company.charAt(0).toUpperCase() +
        maintainer.device_company.slice(1);

      if (companies.indexOf(maintainer.device_company) === -1) {
        companies.push(maintainer.device_company);
      }
    });
    // Remove duplicates (lowercase, upper case)
    companies = companies.filter(
      (company, index, self) =>
        index ===
        self.findIndex((t) => t.toLowerCase() === company.toLowerCase())
    );
    return res.json({
      status: 200,
      message: "Companies",
      companies: companies,
    });
  });
});

/* GET to get maintainer status */
router.get("/status/:id", (req, res, next) => {
  const id = req.params.id;
  console.log("ID: ", id);
  Maintainers.find({ _id: new ObjectID(id) }, (err, maintainer) => {
    console.log(maintainer);
    if (err) {
      return res.json({
        status: 500,
        message: "Error getting maintainer",
        error: err,
      });
    }
    if (!maintainer) {
      return res.json({
        status: 404,
        message: "Maintainer not found",
      });
    }
    return res.json({
      status: 200,
      message: "Maintainer status",
      maintainer: maintainer,
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

  // Check if another maintainer has applied for the same device
  Maintainers.find(
    {
      device_codename: device_codename,
      status: "Accepted",
    },
    (err, maintainer) => {
      if (err) {
        return res.json({
          status: 500,
          message: "Error getting maintainer",
          error: err,
        });
      }
      if (maintainer.length > 0) {
        return res.json({
          status: 403,
          message: "Another maintainer is already maintaining this device",
        });
      }
    }
  );

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
    version: "13",
  });
  newMaintainer
    .save()
    .then((maintainer) => {
      send_email(
        maintainer.email,
        "Maintainer application Recieved",
        `Hello ${maintainer.name},\n\nYour application has been recieved.\n\nWe will get back to you soon.\nYou can check application status at: https://maintainers.stag-os.org/#/status\nYour application id is ${maintainer._id}\n\nThanks,\n\nTeam Stag OS`
      );
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
      // Filter maintainers with version 13
      maintainers = maintainers.filter((maintainer) => {
        if (!maintainer.version) {
          return false;
        }
        if (maintainer.version && maintainer.version !== "13") {
          return false;
        }
        return true;
      });
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
  const review = req.body.review || "No reason provided";
  if (pass === password)
    Maintainers.findByIdAndUpdate(id, { status })
      .then((maintainer) => {
        if (status == "Reviewing") {
          send_email(
            maintainer.email,
            "Maintainer application Reviewing",
            `Hello ${maintainer.name},\n\nYour application is being reviewed.\n\nWe will get back to you soon.\n\nThanks,\n\nTeam Stag OS`
          );
        } else if (status == "Rejected") {
          send_email(
            maintainer.email,
            "Maintainer application Rejected",
            `Hello ${maintainer.name},\n\nWe are sorry, Your application has been rejected for the following reason:\n${review}\n\nThanks,\n\nTeam Stag OS`
          );
        }
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
  const review = req.body.review || "No additional info provided";
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
          send_email(
            maintainer.email,
            "Maintainer application Approved",
            `Hello ${maintainer.name},\n\nCongratulations, Your application has been approved.\n\nPlease join our maintainers telegam group using this link: ${tg_link}. \nThe below is some additional info:\n${review}\n\nThanks,\n\nTeam Stag OS`
          );
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

// Get request that takes device_code name as path parameter and returns tg_username and device_name
router.get("/:device_code", (req, res) => {
  const { device_code } = req.params;
  console.log(device_code);
  // Find maintainer with device_code and status Accepted
  Maintainers.findOne({
    device_codename: device_code,
    version: "13",
    status: "Accepted",
  })
    .then((maintainer) => {
      if (maintainer) {
        return res.json({
          status: 200,
          message: "Maintainer found",
          data: maintainer,
        });
      } else {
        return res.json({
          status: 404,
          message: "Maintainer not found",
        });
      }
    })
    .catch((err) => {
      return res.json({
        status: 500,
        message: "Error getting maintainer",
        error: err,
      });
    });
});

module.exports = router;
