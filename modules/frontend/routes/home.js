const express = require("express");
const router = express.Router();
const Controller = require("../http/controllers/HomeContoller");
router.get("/", Controller.index);
module.exports = router;
