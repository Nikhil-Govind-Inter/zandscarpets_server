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
const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

// Pagination for the listing endpoint — the admin page shows 25 at a time
// and "loads more" on demand.
const DEFAULT_LIST_LIMIT = 25;
const MAX_LIST_LIMIT = 200;
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
  // Read-only listing of whatever is already stored in the folder for the
  // given type, so the admin page can show previously-uploaded files (with a
  // preview) — not just the ones uploaded in the current browser session.
  // Same fixed whitelist as upload: the client never supplies a raw path.
  // Paginated (`limit`/`offset`) so the page can "load more" 25 at a time.
  static async list(req, res) {
    const folder = FOLDER_WHITELIST[req.query?.type];
    if (!folder) {
      return sendValidationError(res, [
        { field: "type", message: `?type= query param must be one of: ${Object.keys(FOLDER_WHITELIST).join(", ")}` },
      ]);
    }

    const parsedLimit = Number.parseInt(req.query?.limit, 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), MAX_LIST_LIMIT) : DEFAULT_LIST_LIMIT;
    const parsedOffset = Number.parseInt(req.query?.offset, 10);
    const offset = Number.isFinite(parsedOffset) ? Math.max(parsedOffset, 0) : 0;

    try {
      const dir = path.join(process.cwd(), "uploads", folder);
      if (!fs.existsSync(dir)) {
        return sendSuccessResponse(res, { files: [], total: 0, limit, offset, hasMore: false }, "Media list retrieved");
      }

      const files = [];
      for (const name of fs.readdirSync(dir)) {
        if (!IMAGE_EXT.test(name)) continue;
        try {
          const stat = fs.statSync(path.join(dir, name));
          if (!stat.isFile()) continue;
          const storedPath = path.join("uploads", folder, name).replace(/\\/g, "/");
          files.push({
            name,
            storedPath,
            previewUrl: `${BASE_URL}/${storedPath}`,
            sizeBytes: stat.size,
            modifiedAt: stat.mtime.toISOString(),
          });
        } catch (_err) {
          // Skip files that vanish / can't be stat'd mid-listing.
        }
      }
      files.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));

      const page = files.slice(offset, offset + limit);
      return sendSuccessResponse(
        res,
        { files: page, total: files.length, limit, offset, hasMore: offset + page.length < files.length },
        "Media list retrieved",
      );
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

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
