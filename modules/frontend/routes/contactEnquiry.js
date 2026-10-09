const express = require("express");
const router = express.Router();
const Controller = require("../http/modules/contactEnquiry/ContactEnquiryController");
const { contactEnquiryUpload } = require("../http/middleware/multerMiddleware");

router.post("/", contactEnquiryUpload, Controller.create);

module.exports = router;


// {{zs_url}}/fontend/contact-enquiry