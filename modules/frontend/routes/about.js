const express = require("express");
const router = express.Router();
const Controller = require("../http/controllers/AboutContoller");



router.get("/", Controller.index);


module.exports = router;
