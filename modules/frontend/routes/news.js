const express = require("express");
const router = express.Router();
const Controller = require("../http/news/NewsController");



router.get("/", Controller.index);
router.get("/:slug", Controller.show); 


module.exports = router;
