const express = require("express");
const router = express.Router();
const Controller = require("../http/modules/quoteRequest/QuoteRequestController");

router.get("/options", Controller.options);
router.post("/", Controller.create);

module.exports = router;
