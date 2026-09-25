const express = require("express");
const router = express.Router();
const Controller = require("../http/modules/contact/ContactController");

router.get("/", Controller.index);

module.exports = router;
