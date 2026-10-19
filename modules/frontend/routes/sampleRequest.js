const express = require("express");
const router = express.Router();
const Controller = require("../http/modules/sampleRequest/SampleRequestController");

router.get("/options", Controller.options);
router.post("/", Controller.create);

module.exports = router;
