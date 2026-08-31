const express = require("express");
const router = express.Router();
const Controller = require("../http/about/AboutController");



router.get("/", Controller.index);


module.exports = router;
