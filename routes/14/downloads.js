var express = require("express");
var router = express.Router();

// Add a simple get route
router.get("/", (req, res) => {
  res.send("This route is not yet implemented");
});

/**
 * Download the latest build
 * TODO: Add variant support
 */
router.get("/:device/", (req, res) => {
  // Redirect to the download page
  res.redirect(
    "https://sourceforge.net/projects/stagos-14/files/" + req.params.device
  );
});

// Export the router
module.exports = router;
