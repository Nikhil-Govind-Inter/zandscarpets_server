const express = require("express");
const router = express.Router();
const Controller = require("../http/modules/downloadRequest/DownloadRequestController");

router.post("/", Controller.create);

module.exports = router;
