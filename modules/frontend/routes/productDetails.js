const express = require("express");
const router = express.Router();
const Controller = require("../http/modules/productDetails/ProductDetailsController");

router.get("/", Controller.forVariant);

module.exports = router;
