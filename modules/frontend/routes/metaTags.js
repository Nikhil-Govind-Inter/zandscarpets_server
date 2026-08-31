const express = require("express");
const router = express.Router();
const MetaTagController = require("../http/metaTag/MetaTagController");

router.get("/:type/:slug", (req, res) => {
  MetaTagController.index(req, res);
});

module.exports = router;
