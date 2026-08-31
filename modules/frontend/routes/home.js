const express = require("express");
const router = express.Router();
const Controller = require("../http/home/HomeController");



router.get("/", Controller.index);


module.exports = router;
