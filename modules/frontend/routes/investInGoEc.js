const express = require("express");
const router = express.Router();
const Controller = require("../http/controllers/InvestInGoEcContoller");



router.get("/", Controller.index);


module.exports = router;
