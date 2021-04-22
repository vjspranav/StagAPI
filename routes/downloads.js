var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/:device/:variant', function(req, res, next) {
  url="download/"+req.params.device + "/" + req.params.variant
  res.send(url);
});

module.exports = router;
