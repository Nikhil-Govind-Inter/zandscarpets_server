const express = require("express");
const router = express.Router();
const Controller = require("../http/modules/floatingIcon/FloatingIconController");

router.get("/", Controller.index);

module.exports = router;
