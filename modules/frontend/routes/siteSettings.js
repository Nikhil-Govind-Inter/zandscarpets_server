const express = require("express");
const router = express.Router();
const Controller = require("../http/modules/siteSettings/SiteSettingsController");

router.get("/", Controller.index);

module.exports = router;
