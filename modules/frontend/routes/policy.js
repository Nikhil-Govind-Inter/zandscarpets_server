const express = require("express");
const router = express.Router();
const Controller = require("../http/modules/policy/PolicyController");



router.get("/:slug", Controller.index);


module.exports = router;
