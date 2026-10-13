const express = require("express");
const router = express.Router();
const Controller = require("../http/modules/metaTag/MetaTagController");

router.get("/", Controller.common);

module.exports = router;