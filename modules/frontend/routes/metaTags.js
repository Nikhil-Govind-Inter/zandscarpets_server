const express = require("express");
const router = express.Router();
const Controller = require("../http/modules/metaTag/MetaTagController");

router.get("/", Controller.index);

module.exports = router;
