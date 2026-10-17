const express = require("express");
const router = express.Router();
const Controller = require("../http/modules/pages/pagesController");

router.get("/", Controller.index);

module.exports = router;
