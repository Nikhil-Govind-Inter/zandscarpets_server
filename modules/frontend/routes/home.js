const express = require("express");
const router = express.Router();
const Controller = require("../http/modules/home/HomeController");



router.get("/", Controller.index);


module.exports = router;
