const express = require("express");
const router = express.Router();
const Controller = require("../http/modules/downloads/DownloadsController");

router.get("/", Controller.page);

module.exports = router;
