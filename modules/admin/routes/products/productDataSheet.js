const express = require("express");
const Controller = require("../../http/controllers/products/productDataSheetController");
const authMiddleware = require("../../http/middleware/authMiddleware");
const {
  createUploadMiddleware,
} = require("../../http/middleware/multerMiddleware");

const router = express.Router();

// Kept separate from the main products upload (products.js) so the main/list
// product images stay image-only — this instance accepts PDFs exclusively.
const upload = createUploadMiddleware("products-data-sheets", [{ name: "file_path" }], {
  onlyPdf: true,
  maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
});

router.use(authMiddleware(["admin", "user"]));
router.get("/", Controller.list);
router.get("/:productId", Controller.getByProductId);
router.put("/:productId", upload, Controller.upsert);
router.delete("/:productId", Controller.destroy);

module.exports = router;
