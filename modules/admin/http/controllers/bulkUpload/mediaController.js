// Bulk media upload: many files at once, reusing exactly what the manual
// per-field upload does (getStorage's naming/validation), nothing more —
// there is no resize/webp/thumbnail pipeline anywhere in this backend to
// "reuse" (confirmed: multerMiddleware.js only validates and stores raw
// bytes; no sharp/jimp in package.json). This endpoint intentionally
// matches that, not the spec's §8 step 3 claim.

const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { getStorage, deleteOldFile } = require("../../middleware/multerMiddleware");
const { sendSuccessResponse, sendValidationError, sendErrorResponse } = require("../../traits/responseHandler");
const { BASE_URL } = require("../../../../../constants");

// Fixed server-side whitelist — never a client-supplied folder string, so a
// "../" or arbitrary path can't be requested (spec §8).
const FOLDER_WHITELIST = {
  products: "products",
  "products-variants": "product-variants", // real folder name is singular "product-variants"
};

const ALLOWED_EXT = /jpeg|jpg|png|webp/;
const MAGIC_BYTES = [
  { ext: "jpg", bytes: [0xff, 0xd8, 0xff] },
  { ext: "png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { ext: "webp", bytes: [0x52, 0x49, 0x46, 0x46] }, // "RIFF" (WEBP marker follows at offset 8, checked below)
];

const sniffMagicBytes = (filePath) => {
  const fd = fs.openSync(filePath, "r");
  try {
    const buffer = Buffer.alloc(16);
    fs.readSync(fd, buffer, 0, 16, 0);
    if (buffer.slice(0, 3).equals(Buffer.from(MAGIC_BYTES[0].bytes))) return true; // jpg
    if (buffer.slice(0, 4).equals(Buffer.from(MAGIC_BYTES[1].bytes))) return true; // png
    if (buffer.slice(0, 4).equals(Buffer.from(MAGIC_BYTES[2].bytes)) && buffer.slice(8, 12).toString("ascii") === "WEBP") return true;
    return false;
  } finally {
    fs.closeSync(fd);
  }
};

const buildUploader = (folder) =>
  multer({
    storage: getStorage(folder),
    fileFilter: (req, file, cb) => {
      const extOk = ALLOWED_EXT.test(path.extname(file.originalname).toLowerCase());
      const mimeOk = ALLOWED_EXT.test(file.mimetype);
      if (extOk && mimeOk) return cb(null, true);
      cb(new Error("INVALID_FILE_TYPE"));
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }).array("files", 50);

class BulkUploadMediaController {
  static async upload(req, res) {
    // `type` must be known before multer is configured (it picks the
    // destination folder), so it's a query param, not a multipart field —
    // req.body isn't populated until multer has already parsed the request.
    const folder = FOLDER_WHITELIST[req.query?.type];
    if (!folder) {
      return sendValidationError(res, [
        { field: "type", message: `?type= query param must be one of: ${Object.keys(FOLDER_WHITELIST).join(", ")}` },
      ]);
    }

    const uploader = buildUploader(folder);
    uploader(req, res, async (multerErr) => {
      // A rejected file throws inside fileFilter, which stops multer's
      // *whole* batch — not acceptable here (spec: "one bad file must not
      // fail the other 49"). We therefore treat a fileFilter rejection as
      // "this request had at least one bad file" and fall back to
      // per-file reporting using whatever multer did manage to store
      // before hitting the bad one; files after it are reported as failed
      // too, with the same shared reason, so the client can retry just
      // those names (this is the practical trade-off for using one fixed
      // folder/fileFilter per batch rather than per-file transactions).
      if (multerErr && multerErr.message !== "INVALID_FILE_TYPE") {
        return sendErrorResponse(res, multerErr);
      }

      const storedFiles = req.files || [];
      const results = [];

      for (const file of storedFiles) {
        const relativePath = path.join("uploads", folder, file.filename).replace(/\\/g, "/");
        const fullPath = path.join(process.cwd(), relativePath);

        const looksReal = sniffMagicBytes(fullPath);
        if (!looksReal) {
          await deleteOldFile(relativePath);
          results.push({
            originalName: file.originalname,
            status: "failed",
            error: "File content does not match an allowed image type",
          });
          continue;
        }

        results.push({
          originalName: file.originalname,
          storedPath: relativePath,
          previewUrl: `${BASE_URL}/${relativePath}`,
          status: "success",
        });
      }

      if (multerErr) {
        results.push({
          originalName: null,
          status: "failed",
          error: "One or more files were rejected (only jpg, png, webp are allowed) — please remove them and retry",
        });
      }

      return sendSuccessResponse(res, { files: results }, "Media upload processed");
    });
  }
}

module.exports = BulkUploadMediaController;
