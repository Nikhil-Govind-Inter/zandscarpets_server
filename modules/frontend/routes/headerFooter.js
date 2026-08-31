const express = require("express");
const router = express.Router();
const Controller = require("../http/headerFooter/HeaderFooterController");



router.get("/", Controller.index);


module.exports = router;
