const express = require("express");
const router = express.Router();
const Controller = require("../http/modules/privacyPolicy/privacyPolicyController");

router.get("/", Controller.index);

module.exports = router;
